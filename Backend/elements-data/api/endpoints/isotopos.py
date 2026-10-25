"""Endpoint de isótopos."""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import cast

from fastapi import APIRouter, HTTPException, Query
from mendeleev import element as mendeleev_element

from isotopos_mendeleev import converter_isotopos_elemento
from schemas_isotopos import DadosIsotoposElemento

router = APIRouter(prefix="/api/elementos", tags=["isotopos"])

# Cache separado por filtro para não reutilizar uma lista reduzida na consulta completa.
CACHE_DIR = Path(__file__).resolve().parents[2] / "cache" / "isotopos"
CACHE_TTL_DAYS = 30
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _caminho_cache(numero_atomico: int, apenas_relevantes: bool) -> Path:
    filtro = "relevantes" if apenas_relevantes else "todos"
    return CACHE_DIR / f"{numero_atomico}-{filtro}.json"


def _cache_is_valid(caminho: Path) -> bool:
    try:
        idade = datetime.now().timestamp() - caminho.stat().st_mtime
    except OSError:
        return False
    return 0 <= idade < timedelta(days=CACHE_TTL_DAYS).total_seconds()


def clear_isotopes_cache() -> None:
    for caminho in CACHE_DIR.glob("*.json"):
        caminho.unlink(missing_ok=True)


@router.get("/{numero_atomico}/isotopos", response_model=DadosIsotoposElemento)
def obter_isotopos(
    numero_atomico: int,
    apenas_relevantes: bool = Query(
        True,
        description="Se True, oculta isótopos sintéticos efêmeros (meia-vida < 1h e sem abundância natural).",
    ),
    force_refresh: bool = Query(
        False, description="Ignora o cache em disco e recalcula."
    ),
) -> DadosIsotoposElemento:
    if not (1 <= numero_atomico <= 118):
        raise HTTPException(status_code=404, detail="Número atômico inválido.")

    caminho = _caminho_cache(numero_atomico, apenas_relevantes)

    # NOTA (aprendizado do projeto): uvicorn --reload não invalida esse cache
    # sozinho. Após mudar a lógica de conversão, apague os .json em
    # cache/isotopos/ ou chame este endpoint com ?force_refresh=true.
    if not force_refresh and _cache_is_valid(caminho):
        try:
            return DadosIsotoposElemento.model_validate(
                json.loads(caminho.read_text(encoding="utf-8"))
            )
        except (OSError, json.JSONDecodeError, ValueError):
            pass

    try:
        el = mendeleev_element(numero_atomico)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Elemento não encontrado.") from exc

    # The ORM model annotates loaded columns as Column[T], though SQLAlchemy
    # returns their scalar values on a queried instance.
    numero_atomico_elemento = cast(int, el.atomic_number)
    simbolo_elemento = cast(str, el.symbol)
    nome_elemento = cast(str, el.name)
    isotopos = converter_isotopos_elemento(
        el.isotopes, simbolo_elemento, apenas_relevantes
    )

    dados = DadosIsotoposElemento(
        numeroAtomico=numero_atomico_elemento,
        simboloElemento=simbolo_elemento,
        nomeElemento=nome_elemento,
        isotopos=isotopos,
    )

    caminho.write_text(dados.model_dump_json(), encoding="utf-8")
    return dados