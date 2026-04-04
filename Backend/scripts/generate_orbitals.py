"""Ponto de entrada para geração de orbitais."""

import sys
from pathlib import Path
import argparse

# Adicionar Backend ao path para permitir imports absolutos
caminho_backend = Path(__file__).parent.parent
sys.path.insert(0, str(caminho_backend))

from scripts.generator import orbitals_generator
from utils.helpers import check_and_group_orbital
from scripts.runner import main


__all__ = ["orbitals_generator", "check_and_group_orbital", "main"]


def gerar_lote(
    n_minimo: int = 1, n_maximo: int = 7, mapa_cores: str = "plasma"
) -> None:
    """Gera orbitais em lote (batch)."""
    main(n_min=n_minimo, n_max=n_maximo, cmap=mapa_cores)


def gerar_orbital_individual(
    n: int, l: int, m: int, projecao: str, mapa_cores: str = "plasma"
) -> None:
    """Gera um orbital específico."""
    print(f"Gerando orbital individual: ({n}, {l}, {m}) - projeção {projecao}")
    orbitals_generator(n, l, m, projecao, cmap=mapa_cores)
    print("✓ Orbital gerado com sucesso!")


def gerar_projecoes_agrupadas(
    n: int, l: int, m: int, mapa_cores: str = "plasma"
) -> None:
    """Gera as 4 projeções de um orbital e agrupa as imagens."""
    planos = ["xz", "yz", "xy", "3d"]
    for plano in planos:
        orbitals_generator(n, l, m, plano, cmap=mapa_cores)

    # Depois de gerar todas as 4 imagens de um orbital, agrupar
    backend_folder = Path(__file__).parent.parent
    images_folder = backend_folder / "images"
    check_and_group_orbital(n, l, m, str(images_folder))


if __name__ == "__main__":
    analisador = argparse.ArgumentParser(description="Gerador de Orbitais Atômicos")
    subparsers = analisador.add_subparsers(dest="comando", help="Comando")

    # Comando: lote
    analisador_lote = subparsers.add_parser("lote", help="Gera orbitais em lote")
    analisador_lote.add_argument(
        "--n-minimo", type=int, default=1, help="Nível quântico mínimo (padrão: 1)"
    )
    analisador_lote.add_argument(
        "--n-maximo", type=int, default=7, help="Nível quântico máximo (padrão: 7)"
    )
    analisador_lote.add_argument(
        "--mapa-cores",
        type=str,
        default="plasma",
        help="Mapa de cores (padrão: plasma)",
    )

    # Comando: individual
    analisador_individual = subparsers.add_parser(
        "individual", help="Gera um orbital específico"
    )
    analisador_individual.add_argument("n", type=int, help="Número quântico principal")
    analisador_individual.add_argument("l", type=int, help="Número quântico angular")
    analisador_individual.add_argument("m", type=int, help="Número quântico magnético")
    analisador_individual.add_argument(
        "--projecao",
        type=str,
        default="xy",
        choices=["xy", "xz", "yz", "3d"],
        help="Tipo de projeção: xy (padrão), xz, yz, 3d",
    )
    analisador_individual.add_argument(
        "--mapa-cores",
        type=str,
        default="plasma",
        help="Mapa de cores (padrão: plasma)",
    )

    # Comando: agrupado
    analisador_agrupado = subparsers.add_parser(
        "agrupado", help="Gera projeções de um orbital e as agrupa"
    )
    analisador_agrupado.add_argument("n", type=int, help="Número quântico principal")
    analisador_agrupado.add_argument("l", type=int, help="Número quântico angular")
    analisador_agrupado.add_argument("m", type=int, help="Número quântico magnético")
    analisador_agrupado.add_argument(
        "--mapa-cores",
        type=str,
        default="plasma",
        help="Mapa de cores (padrão: plasma)",
    )

    argumentos = analisador.parse_args()

# Executa a função correspondente ao comando escolhido
    match argumentos.comando:
        case "lote":
            gerar_lote(
                n_minimo=argumentos.n_minimo,
                n_maximo=argumentos.n_maximo,
                mapa_cores=argumentos.mapa_cores,
            )
        case "individual":
            gerar_orbital_individual(
                argumentos.n,
                argumentos.l,
                argumentos.m,
                argumentos.projecao,
                argumentos.mapa_cores,
            )
        case "agrupado":
            gerar_projecoes_agrupadas(
                argumentos.n,
                argumentos.l,
                argumentos.m,
                argumentos.mapa_cores,
            )
        case _:
            # Padrão: batch completo
            gerar_lote()
