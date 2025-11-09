from typing import Optional
from render_orbital import render_orbital
import os
import time
from tqdm import tqdm
from colorama import Fore, Back, Style, init

# Inicializa colorama para suportar cores no terminal
init() 

def orbitals_generator(
    n: int,
    l: int,
    m: int,
    projection: str,
    plane_offset: float = 0.0,  # Sempre float, nunca None
    samples: int = 400,
    filename: Optional[str] = None,
) -> str:
    """Gera a imagem do orbital atômico especificado."""
    if filename is None:
        base_dir = f"Backend/images/{n}-{l}-{m}"
        os.makedirs(base_dir, exist_ok=True)
        filename = f"{base_dir}/{n}-{l}-{m}-cross-section-{projection}.png"

    # Se offset é 0.0 e é um orbital problemático, usar offset automático
    if plane_offset == 0.0 and projection == "xy":
        if (l == 1 and m == 0) or (l == 2 and abs(m) == 1):  # pz, dxz, dyz
            plane_offset = 0.7
            print(
                f"{Fore.YELLOW}Ajustando offset para {plane_offset} para o orbital ({n},{l},{m}){Style.RESET_ALL}"
            )
        elif l == 2 and m == 0:  # dz²
            plane_offset = 0.6
            print(
                f"{Fore.YELLOW}Ajustando offset para {plane_offset} para o orbital ({n},{l},{m}){Style.RESET_ALL}"
            )

    try:
        result = render_orbital(
            n,
            l,
            m,
            plane=projection,
            filename=filename,
            samples=samples,
            plane_offset=plane_offset,
        )
        print(
            f"{Fore.GREEN}✓ Sucesso: ({n},{l},{m}) {projection} com offset {plane_offset}{Style.RESET_ALL}"
        )
        return result

    except Exception as e:
        print(f"{Fore.RED}✗ Falha: ({n},{l},{m}) {projection} - {e}{Style.RESET_ALL}")
        if plane_offset == 0.0:
            print("Tentando novamente com offset 0.05...")
            offset_new = 0.05
            return orbitals_generator(n, l, m, projection, offset_new, samples, filename)
        return ""


# Gerar orbitais
if __name__ == "__main__":

# número de combinações desde n=1: N(N+1)(2N+1)/6 --> O(N^3)
    n_max: int = 7
    total_combinations: int = (n_max * (n_max + 1) * (2 * n_max + 1)) // 6
    total_imagens: int = total_combinations * 4
    planes: list[str] = ["xz", "yz", "xy","3d"]
    atual: int = 0
    
    print(f"{Fore.CYAN}Total de imagens: {total_imagens}\n{Style.RESET_ALL}")
    
    barra_progresso = tqdm(total=total_imagens, ncols=100, unit='combinações')
    for n in range(1, n_max + 1):
        for l in range(0, n):
            for m in range(-l, l + 1):
                for plane in planes:
                           orbitals_generator(n, l, m, plane)
                           atual += 1
                           barra_progresso.update(1)
                           print()
                           time.sleep(0.01)  

    barra_progresso.close()

                        
    # orbitals_generator(3, 1, 0, "xy")
