from colorama import Fore, Back, Style, init
from pathlib import Path
from grouping_figures import create_grouped_figure

# Inicializa colorama para suportar cores no terminal ao importar este módulo
init()


def check_and_group_orbital(n: int, l: int, m: int, images_folder: str) -> bool:
    """
    Verifica se todas as 4 imagens de um orbital foram geradas e agrupa se estiverem prontas.

    Args:
        n, l, m: Números quânticos do orbital
        images_folder: Caminho da pasta contendo as imagens

    Returns:
        bool: True se agrupamento foi bem-sucedido, False caso contrário
    """
    orbital_name = f"{n}-{l}-{m}"
    orbital_folder = Path(images_folder) / orbital_name

    # Verificar se todos os 4 arquivos necessários existem
    required_files = [
        f"{orbital_name}-3d-real.png",
        f"{orbital_name}-cross-section-xz.png",
        f"{orbital_name}-cross-section-yz.png",
        f"{orbital_name}-cross-section-xy.png",
    ]

    if all((orbital_folder / file).exists() for file in required_files):
        try:
            grouped_folder = Path(images_folder) / "grouped"
            grouped_folder.mkdir(parents=True, exist_ok=True)
            output_path = grouped_folder / f"{orbital_name}-combined.png"

            create_grouped_figure(str(images_folder), orbital_name, str(output_path))
            print(
                f"{Fore.CYAN}  → Agrupadas 4 imagens para ({n},{l},{m}){Style.RESET_ALL}"
            )
            return True
        except Exception as e:
            print(
                f"{Fore.YELLOW}  ⚠ Erro ao agrupar ({n},{l},{m}): {e}{Style.RESET_ALL}"
            )
            return False
    return False
