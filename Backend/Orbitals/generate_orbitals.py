from typing import Optional
from render_orbital import render_orbital
from grouping_figures import create_grouped_figure
import os
from tqdm import tqdm
from colorama import Fore, Back, Style, init
from pathlib import Path

# Inicializa colorama para suportar cores no terminal
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


def orbitals_generator(
    n: int,
    l: int,
    m: int,
    projection: str,
    plano_offset: float = 0.0,  # Sempre float, nunca None
    samples: int = 400,
    filename: Optional[str] = None,
    cmap: str = "magma",
) -> str:
    """Gera a imagem do orbital atômico especificado."""
    if filename is None:
        base_dir = f"Backend/images/{n}-{l}-{m}"
        os.makedirs(base_dir, exist_ok=True)
        filename = f"{base_dir}/{n}-{l}-{m}-cross-section-{projection}.png"

    # Se offset é 0.0 e é um orbital problemático, usar offset automático
    if plano_offset == 0.0 and projection == "xy":
        if (l == 1 and m == 0) or (l == 2 and abs(m) == 1):  # pz, dxz, dyz
            plano_offset = 0.7
            print(
                f"{Fore.YELLOW}Ajustando offset para {plano_offset} para o orbital ({n},{l},{m}){Style.RESET_ALL}"
            )
        elif l == 2 and m == 0:  # dz²
            plano_offset = 0.6
            print(
                f"{Fore.YELLOW}Ajustando offset para {plano_offset} para o orbital ({n},{l},{m}){Style.RESET_ALL}"
            )

    try:
        result = render_orbital(
            n,
            l,
            m,
            plane=projection,
            filename=filename,
            samples=samples,
            plane_offset=plano_offset,
            cmap=cmap,
        )
        print(
            f"{Fore.GREEN}✓ Sucesso: ({n},{l},{m}) {projection} com offset {plano_offset}{Style.RESET_ALL}"
        )
        return result

    except Exception as e:
        print(f"{Fore.RED}✗ Falha: ({n},{l},{m}) {projection} - {e}{Style.RESET_ALL}")
        if plano_offset == 0.0:
            print("Tentando novamente com offset 0.05...")
            offset_new = 0.05
            return orbitals_generator(
                n, l, m, projection, offset_new, samples, filename, cmap
            )
        return ""


# Gerar orbitais
if __name__ == "__main__":

    # # número de combinações desde n=1: N(N+1)(2N+1)/6 --> O(N^3)
    n_min: int = 3
    n_max: int = 3
    total_combinacoes: int = (n_max * (n_max + 1) * (2 * n_max + 1)) // 6
    total_imagens: int = total_combinacoes * 4
    planos: list[str] = ["xz", "yz", "xy", "3d"]
    atual: int = 0
    cmap = "plasma"
    # lista de cmaps interessantes
    # cmaps = ["viridis", "plasma", "inferno", "magma", "cividis", "twilight", "twilight_shifted", "hsv"]
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
    # orbitals_generator(2,0,0, "3d", cmap="plasma")
    # orbitals_generator(3,0,0, "3d", cmap="plasma")
    # orbitals_generator(4,0,0, "3d", cmap="plasma")
    # orbitals_generator(5,0,0, "3d", cmap="plasma")
    # orbitals_generator(3,1,0, "3d", cmap="plasma")
    # orbitals_generator(4,2,1, "3d", cmap="plasma")
