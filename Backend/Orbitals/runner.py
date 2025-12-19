from migrate_images import migrate_images_to_db
from tqdm import tqdm
from pathlib import Path
from colorama import Fore, Back, Style
from generator import orbitals_generator
from helpers import check_and_group_orbital


def main(n_min: int = 6, n_max: int = 7, cmap: str = "plasma"):
    """Loop principal que gera orbitais e agrupa imagens."""
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

    # Migrar imagens para o banco de dados
    # migrate_images_to_db("Backend/images")


if __name__ == "__main__":
    main()
