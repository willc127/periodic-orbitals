from typing import Optional
from render_orbital import render_orbital
from colorama import Fore, Style
import os


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
