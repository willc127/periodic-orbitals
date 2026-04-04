"""Orbital generation script utilities."""

from typing import Optional
from core.render_orbital import render_orbital
from colorama import Fore, Style
import os

# Offsets específicos para orbitais problemáticos conhecidos
PROBLEMATIC_ORBITALS_XY_OFFSETS = {
    (5, 3, -2): 0.85,
    (5, 3, 2): 0.75,
    (5, 4, -3): 1.05,
    (5, 4, 3): 0.95,
    (6, 5, -4): 1.25,
    (6, 5, 4): 1.15,
    (6, 4, -3): 1.10,
    (6, 4, 3): 1.00,
    (6, 3, -2): 0.90,
    (6, 3, 2): 0.80,
    (7, 3, -2): 0.95,
    (7, 3, 2): 0.85,
    (7, 4, -3): 1.15,
    (7, 4, 3): 1.05,
    (7, 5, -4): 1.30,
    (7, 5, 4): 1.20,
    (7, 6, -5): 1.45,
    (7, 6, 5): 1.35,
}


def orbitals_generator(
    n: int,
    l: int,
    m: int,
    projection: str,
    plano_offset: float = 0.0,
    samples: int = 400,
    filename: Optional[str] = None,
    cmap: str = "magma",
) -> str:
    """
    Gera a imagem do orbital atômico especificado.

    Args:
        n: Número quântico principal
        l: Número quântico angular
        m: Número quântico magnético
        projection: Tipo de projeção ('xy', 'xz', 'yz', ou '3d')
        plano_offset: Offset no plano perpendicular
        samples: Número de amostras por dimensão
        filename: Caminho para salvar a imagem
        cmap: Colormap a usar

    Returns:
        Caminho do arquivo salvo
    """
    if filename is None:
        base_dir = f"Backend/images/cross-section-and-3d/{n}-{l}-{m}"
        os.makedirs(base_dir, exist_ok=True)
        filename = f"{base_dir}/{n}-{l}-{m}-cross-section-{projection}.png"

    # Aumentar samples para orbitais problemáticos
    if (n, l, m) in PROBLEMATIC_ORBITALS_XY_OFFSETS and projection == "xy":
        samples = max(samples, 600)

    # Se offset é 0.0 e é um orbital problemático, usar offset automático
    if plano_offset == 0.0 and projection == "xy":
        # Verificar se é um orbital problemático conhecido
        if (n, l, m) in PROBLEMATIC_ORBITALS_XY_OFFSETS:
            plano_offset = PROBLEMATIC_ORBITALS_XY_OFFSETS[(n, l, m)]
            print(
                f"{Fore.YELLOW}Usando offset específico {plano_offset} para orbital problemático ({n},{l},{m}){Style.RESET_ALL}"
            )
        # Padrão: todos com m ≠ 0 precisam de offset
        elif m != 0:
            plano_offset = min(1.3, 0.2 + 0.18 * abs(m) + 0.12 * l + 0.04 * n)
            print(
                f"{Fore.YELLOW}Ajustando offset para {plano_offset} (m≠0, l={l}, n={n}) para o orbital ({n},{l},{m}){Style.RESET_ALL}"
            )
        # Orbitais com l ≥ 3 também podem ter baixa dinâmica em z=0
        elif l >= 3:
            plano_offset = 0.4 + 0.08 * l
            print(
                f"{Fore.YELLOW}Ajustando offset para {plano_offset} (l≥3) para o orbital ({n},{l},{m}){Style.RESET_ALL}"
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
        error_msg = str(e)
        print(f"{Fore.RED}✗ Falha: ({n},{l},{m}) {projection} - {e}{Style.RESET_ALL}")

        # Estratégia de fallback: tentar com offsets progressivamente maiores
        if "vmin must be less or equal to vmax" in error_msg or plano_offset < 1.5:
            fallback_offsets = [
                0.05,
                0.1,
                0.15,
                0.2,
                0.25,
                0.3,
                0.4,
                0.5,
                0.6,
                0.7,
                0.8,
                0.9,
                1.0,
                1.1,
                1.2,
                1.3,
                1.4,
                1.5,
            ]

            for new_offset in fallback_offsets:
                if new_offset > plano_offset:
                    print(
                        f"{Fore.CYAN}Tentando novamente com offset {new_offset}...{Style.RESET_ALL}"
                    )
                    try:
                        result = render_orbital(
                            n,
                            l,
                            m,
                            plane=projection,
                            filename=filename,
                            samples=samples,
                            plane_offset=new_offset,
                            cmap=cmap,
                        )
                        print(
                            f"{Fore.GREEN}✓ Sucesso: ({n},{l},{m}) {projection} com offset {new_offset}{Style.RESET_ALL}"
                        )
                        return result
                    except Exception as retry_e:
                        print(
                            f"{Fore.RED}✗ Offset {new_offset} falhou: {retry_e}{Style.RESET_ALL}"
                        )
                        continue

        print(
            f"{Fore.RED}Esgotadas todas as tentativas para ({n},{l},{m}) {projection}{Style.RESET_ALL}"
        )
        return ""
