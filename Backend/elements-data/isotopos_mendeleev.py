"""
Lógica de conversão dos dados de isótopo da biblioteca `mendeleev` para o formato
consumido pelo frontend (isotopos.models.ts). Mantido isolado do FastAPI/cache
para facilitar testes unitários.
"""
from typing import Optional, cast
from mendeleev.models import Isotope as IsotopoMendeleev

from schemas_isotopos import Isotopo as IsotopoDados

SUBSCRITOS_SUPERSCRITOS = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")

# Unidades de meia-vida retornadas pelo mendeleev -> rótulo em PT-BR
UNIDADES_MEIA_VIDA_PT = {
    "asec": "attossegundos",
    "fsec": "femtossegundos",
    "ysec": "yoctossegundos",
    "zsec": "zeptossegundos",
    "psec": "picossegundos",
    "nsec": "nanossegundos",
    "usec": "microssegundos",
    "msec": "milissegundos",
    "sec": "segundos",
    "minute": "minutos",
    "hour": "horas",
    "day": "dias",
    "year": "anos",
    "kyear": "mil anos",
    "Myear": "milhões de anos",
    "Tyear": "trilhões de anos",
    "Pyear": "quadrilhões de anos",
    "Gyear": "bilhões de anos",
    "Eyear": "quintilhões de anos",
    "Zyear": "sextilhões de anos",
    "Yyear": "septilhões de anos",
}

# Códigos de decaimento do mendeleev -> símbolo/abreviação usual
MODOS_DECAIMENTO_PT = {
    "A": "α",
    "B-": "β⁻",
    "B+": "β⁺",
    "EC": "captura eletrônica",
    "SF": "fissão espontânea",
    "p": "emissão de próton",
    "n": "emissão de nêutron",
    "2p": "emissão de 2 prótons",
    "2n": "emissão de 2 nêutrons",
    "3n": "emissão de 3 nêutrons",
    "3p": "emissão de 3 prótons",
    "B-n": "β⁻ + nêutron",
    "B+p": "β⁺ + próton",
    "2B-": "2β⁻",
    "2B+": "2β⁺",
    "B-A": "β⁻ + α",
    "B+A": "β⁺ + α",
    "B+SF": "β⁺ + fissão espontânea",
}


def formatar_simbolo_isotopo(numero_massa: int, simbolo_elemento: str) -> str:
    """Ex: (235, 'U') -> '²³⁵U'"""
    return f"{str(numero_massa).translate(SUBSCRITOS_SUPERSCRITOS)}{simbolo_elemento}"


def formatar_meia_vida(isotopo: IsotopoMendeleev) -> Optional[str]:
    if isotopo.half_life is None or isotopo.half_life_unit is None:
        return None
    codigo_unidade = cast(str, isotopo.half_life_unit)
    unidade = UNIDADES_MEIA_VIDA_PT.get(codigo_unidade, codigo_unidade)
    return f"{isotopo.half_life:g} {unidade}"


def modo_decaimento_principal(isotopo: IsotopoMendeleev) -> Optional[str]:
    """
    Um isótopo pode ter múltiplos modos de decaimento registrados (ex: alfa e
    fissão espontânea concorrentes). Escolhe o de maior intensidade relatada;
    na ausência de intensidade conhecida, usa o primeiro modo com relação '='
    ou '~' (evita modos marcados apenas como teoricamente permitidos e nunca
    observados).
    """
    modos = isotopo.decay_modes or []
    if not modos:
        return None

    com_intensidade = [m for m in modos if m.intensity is not None]
    if com_intensidade:
        escolhido = max(com_intensidade, key=lambda m: m.intensity)
    else:
        observados = [m for m in modos if m.relation in ("=", "~")]
        escolhido = observados[0] if observados else modos[0]

    codigo_modo = cast(str, escolhido.mode)
    return MODOS_DECAIMENTO_PT.get(codigo_modo, codigo_modo)


def converter_isotopo(
    isotopo: IsotopoMendeleev,
    simbolo_elemento: str,
) -> IsotopoDados:
    numero_massa = cast(int, isotopo.mass_number)
    estavel = cast(bool, isotopo.is_stable)
    abundancia = cast(Optional[float], isotopo.abundance)
    return IsotopoDados(
        numeroMassa=numero_massa,
        simboloIsotopo=formatar_simbolo_isotopo(numero_massa, simbolo_elemento),
        abundanciaNatural=abundancia or 0.0,
        estavel=estavel,
        meiaVida=None if estavel else formatar_meia_vida(isotopo),
        modoDecaimento=None if estavel else modo_decaimento_principal(isotopo),
    )


# Fatores de conversão para segundos, usados apenas para o filtro de relevância abaixo.
_SEGUNDOS_POR_UNIDADE = {
    "asec": 1e-18, "fsec": 1e-15, "ysec": 1e-24, "zsec": 1e-21,
    "psec": 1e-12, "nsec": 1e-9, "usec": 1e-6, "msec": 1e-3,
    "sec": 1, "minute": 60, "hour": 3600, "day": 86400,
    "year": 31557600, "kyear": 31557600e3, "Myear": 31557600e6,
    "Gyear": 31557600e9, "Tyear": 31557600e12, "Pyear": 31557600e15,
    "Eyear": 31557600e18, "Zyear": 31557600e21, "Yyear": 31557600e24,
}

LIMIAR_MEIA_VIDA_RELEVANTE_SEGUNDOS = 3600  # 1 hora


def _meia_vida_em_segundos(isotopo: IsotopoMendeleev) -> float:
    if isotopo.half_life is None or isotopo.half_life_unit is None:
        return 0.0
    fator = _SEGUNDOS_POR_UNIDADE.get(cast(str, isotopo.half_life_unit), 0.0)
    return isotopo.half_life * fator


def isotopo_e_relevante(isotopo: IsotopoMendeleev) -> bool:
    """
    Filtra isótopos puramente sintéticos e efêmeros (a maioria dos ~250
    isótopos que o mendeleev conhece no total), mantendo:
    - todos os isótopos estáveis
    - qualquer isótopo com abundância natural registrada (traços incluídos)
    - isótopos radioativos "notáveis", com meia-vida acima de 1 hora
      (ex: U-238, Tc-99, C-14), já que são os relevantes para uma visão
      geral de química/educacional.
    """
    if cast(bool, isotopo.is_stable):
        return True
    if cast(Optional[float], isotopo.abundance):
        return True
    return _meia_vida_em_segundos(isotopo) >= LIMIAR_MEIA_VIDA_RELEVANTE_SEGUNDOS


def converter_isotopos_elemento(
    isotopos: list[IsotopoMendeleev],
    simbolo_elemento: str,
    apenas_relevantes: bool = True,
) -> list[IsotopoDados]:
    selecionados = (
        [i for i in isotopos if isotopo_e_relevante(i)] if apenas_relevantes else isotopos
    )
    return [converter_isotopo(i, simbolo_elemento) for i in selecionados]
