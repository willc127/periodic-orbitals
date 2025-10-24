from typing import Optional
from render_orbital import render_orbital
import os

from colorama import Fore, Back, Style, init
init()


def orbitals_generator(
    n: int,
    l: int,
    m: int,
    projection: str,
    plane_offset: float = 0.0,
    samples: int = 400,
    filename: Optional[str] = None,
) -> str:
    """
    Gera seção do orbital no plano projection in {"xz","xy","yz"}.
    plane_offset: deslocamento na coordenada perpendicular ao plano
      - plane='xy' -> plane_offset é z
      - plane='xz' -> plane_offset é y
      - plane='yz' -> plane_offset é x
    Retorna o caminho do arquivo gerado.
    """

    # Garante que o diretório existe
    if filename is None:
        base_dir = f"images/{n}-{l}-{m}"
        os.makedirs(base_dir, exist_ok=True)
        filename = f"{base_dir}/{n}-{l}-{m}-cross-section-{projection}.png"
        print(
            f"Rendering orbital ({n}, {l}, {m}) at {projection}, saving to {filename}"
        )

    try:
        return render_orbital(
            n,
            l,
            m,
            plane=projection,
            filename=filename,
            samples=samples,
            plane_offset=plane_offset,
        )
    except ValueError as e:
        print(
            f"{Fore.WHITE}{Back.RED} Warning: Could not render orbital ({n},{l},{m}) in {projection} plane: {e} {Style.RESET_ALL}"
        )
        # Tenta com offset maior se falhou
        if plane_offset == 0.0:
            print("Retrying with offset 0.05...")
            return orbitals_generator(n, l, m, projection, 0.05, samples, filename)
        return ""


if __name__ == "__main__":

    n_max = 3
    planes = ["xz", "yz", "xy","3d"]
    for n in range(1, n_max + 1):
        for l in range(0, n):
            for m in range(-l, l + 1):
                for plane in planes:
                    orbitals_generator(n, l, m, plane)

