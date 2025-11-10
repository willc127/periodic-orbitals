from typing import Optional
from render_orbital import render_orbital
import os
from tqdm import tqdm
from colorama import Fore, Back, Style, init

# Inicializa colorama para suportar cores no terminal
init()


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
    n_min: int = 1
    n_max: int = 1
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
                    

    barra_progresso.close()

    # orbitals_generator(1,0,0, "3d", cmap="plasma")
    # orbitals_generator(2,0,0, "3d", cmap="plasma")
    # orbitals_generator(3,0,0, "3d", cmap="plasma")
    # orbitals_generator(4,0,0, "3d", cmap="plasma")
    # orbitals_generator(5,0,0, "3d", cmap="plasma")
    # orbitals_generator(3,1,0, "3d", cmap="plasma")
    # orbitals_generator(4,2,1, "3d", cmap="plasma")
