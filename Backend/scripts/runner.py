"""Main runner script for orbital generation."""

import sys
from pathlib import Path


# Adicionar Backend ao path para permitir imports absolutos
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from utils.migrate_images import migrate_images_to_db
from tqdm import tqdm
from colorama import Fore, Back, Style
from scripts.generator import orbitals_generator
from utils.helpers import check_and_group_orbital


def main(n_min: int, n_max: int, cmap: str = "plasma") -> None:
    """
    Loop principal que gera orbitais e agrupa imagens.

    Args:
        n_min: Número quântico principal mínimo
        n_max: Número quântico principal máximo
        cmap: Colormap a usar para renderização
    """
    # número de combinações desde n=1: N(N+1)(2N+1)/6 --> O(N^3)
    total_combinacoes: int = (n_max * (n_max + 1) * (2 * n_max + 1)) // 6
    total_imagens: int = total_combinacoes * 4
    planos: list[str] = ["xz", "yz", "xy", "3d"]
    atual: int = 0

    print(f"{Fore.GREEN}{Back.WHITE}------------------------------")
    print(f"Preparando para renderizar {total_imagens} imagens...\n")
    print(f"{Fore.GREEN}{Back.WHITE}------------------------------{Style.RESET_ALL}")

    barra_progresso = tqdm(total=total_imagens, ncols=100, unit="combinações")
    for n in range(n_min, n_max + 1):
        for l in range(0, n):
            for m in range(-l, l + 1):
                for plano in planos:
                    orbitals_generator(n, l, m, plano, cmap=cmap)
                    atual += 1
                    barra_progresso.update(1)
                    print()

                # Depois de gerar todas as 4 imagens de um orbital, agrupar
                backend_folder = Path(__file__).parent.parent
                images_folder = backend_folder / "images"
                check_and_group_orbital(n, l, m, str(images_folder))

    barra_progresso.close()

    print(f"\n{Fore.GREEN}{Back.WHITE}------------------------------")
    print(f"Processo concluído!\n")
    print(f"{Fore.GREEN}{Back.WHITE}------------------------------{Style.RESET_ALL}")
