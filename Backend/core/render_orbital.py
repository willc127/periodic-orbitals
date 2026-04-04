"""Orbital rendering module for cross-sections."""

from utils.save_figure import save_figure
from typing import Optional

from core.render_3d import render_3d
from core.hydrogen import cartesian_prob_real
from core.get_render_radius import get_render_radius
import numpy as np

from colorama import Fore, Style, init

init()


def _render_radius_eff(n: int, l: int) -> float:
    """Calcula o raio efetivo de renderização para o orbital."""
    render_radius = get_render_radius(n, l)
    match n:
        case 1:
            return render_radius * 3.5
        case 2:
            return render_radius * 3.0
        case 3:
            return render_radius * 2.0
        case 4:
            return render_radius * 2.0
        case 5:
            return render_radius * 1.5
        case 6:
            return render_radius * 1.75
        case 7:
            return render_radius * 1.75
        case _:
            return render_radius * 1.0


def _build_cross_section_arr(
    n: int,
    l: int,
    m: int,
    render_radius_eff: float,
    samples: int,
    plane: str,
    plane_offset: float,
) -> np.ndarray:
    """Constrói array de probabilidades para uma seção cruzada."""
    s = samples
    step = 2 * render_radius_eff / s

    if plane == "xz":
        # linhas -> z, colunas -> x (horizontal = x, vertical = z)
        arr = [
            [
                cartesian_prob_real(
                    n,
                    l,
                    m,
                    (float(x) - s / 2) * step,
                    plane_offset,
                    (float(z) - s / 2) * step,
                )
                for x in range(s + 1)
            ]
            for z in range(s + 1)
        ]
    elif plane == "xy":
        # linhas -> y, colunas -> x (horizontal = x, vertical = y)
        arr = [
            [
                cartesian_prob_real(
                    n,
                    l,
                    m,
                    (float(x) - s / 2) * step,
                    (float(y) - s / 2) * step,
                    plane_offset,
                )
                for x in range(s + 1)
            ]
            for y in range(s + 1)
        ]
    elif plane == "yz":
        # linhas -> z, colunas -> y (horizontal = y, vertical = z)
        arr = [
            [
                cartesian_prob_real(
                    n,
                    l,
                    m,
                    plane_offset,
                    (float(y) - s / 2) * step,
                    (float(z) - s / 2) * step,
                )
                for y in range(s + 1)
            ]
            for z in range(s + 1)
        ]
    else:
        raise ValueError("Plano inválido para seção cruzada")

    return np.asarray(arr, dtype=float)


def _render_cross_section(
    n: int,
    l: int,
    m: int,
    plane: str,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """Renderiza uma seção cruzada do orbital."""
    plane = plane.lower()
    render_radius_eff = _render_radius_eff(n, l)
    arr = _build_cross_section_arr(
        n, l, m, render_radius_eff, samples, plane, plane_offset
    )

    title_map = {
        "xz": f"Plano XZ ({n}, {l}, {m})",
        "xy": f"Plano XY ({n}, {l}, {m})",
        "yz": f"Plano YZ ({n}, {l}, {m})",
    }

    file_map = {
        "xz": filename or f"Backend/images/cross-section-and-3d/{n}-{l}-{m}-cross-section-xz.png",
        "xy": filename or f"Backend/images/cross-section-and-3d/{n}-{l}-{m}-cross-section-xy.png",
        "yz": filename or f"Backend/images/cross-section-and-3d/{n}-{l}-{m}-cross-section-yz.png",
    }

    axis_map = {
        "xz": (r"x ($a_{0}$)", r"z ($a_{0}$)"),
        "xy": (r"x ($a_{0}$)", r"y ($a_{0}$)"),
        "yz": (r"y ($a_{0}$)", r"z ($a_{0}$)"),
    }

    print(f"Plano {plane.upper()}: {n}-{l}-{m} {Fore.GREEN}Concluído{Style.RESET_ALL}")

    fname = file_map[plane]
    title = title_map[plane]
    xlabel, ylabel = axis_map[plane]
    save_figure(arr, render_radius_eff, xlabel, ylabel, title, fname, cmap=cmap)
    return fname


def render_cross_section_xz(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """Renderiza seção cruzada no plano XZ."""
    return _render_cross_section(
        n,
        l,
        m,
        "xz",
        filename=filename,
        samples=samples,
        plane_offset=plane_offset,
        cmap=cmap,
    )


def render_cross_section_xy(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """Renderiza seção cruzada no plano XY."""
    return _render_cross_section(
        n,
        l,
        m,
        "xy",
        filename=filename,
        samples=samples,
        plane_offset=plane_offset,
        cmap=cmap,
    )


def render_cross_section_yz(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """Renderiza seção cruzada no plano YZ."""
    return _render_cross_section(
        n,
        l,
        m,
        "yz",
        filename=filename,
        samples=samples,
        plane_offset=plane_offset,
        cmap=cmap,
    )


def render_orbital(
    n: int,
    l: int,
    m: int,
    plane: str,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """
    Renderiza um orbital atômico em uma visualização 2D ou 3D.

    Args:
        n: Número quântico principal
        l: Número quântico angular
        m: Número quântico magnético
        plane: Plano de renderização ('xz', 'xy', 'yz', ou '3d')
        filename: Caminho para salvar a imagem
        samples: Número de amostras por dimensão
        plane_offset: Offset perpendicular ao plano
        cmap: Colormap a usar

    Returns:
        Caminho do arquivo salvo

    Raises:
        ValueError: Se o plano for inválido
    """
    plane = plane.lower()
    if plane == "xz":
        print(f"Renderizando seção cruzada XZ para ({n}, {l}, {m})")
        return render_cross_section_xz(
            n,
            l,
            m,
            filename=filename,
            samples=samples,
            plane_offset=plane_offset,
            cmap=cmap,
        )
    if plane == "xy":
        print(f"Renderizando seção cruzada XY para ({n}, {l}, {m})")
        return render_cross_section_xy(
            n,
            l,
            m,
            filename=filename,
            samples=samples,
            plane_offset=plane_offset,
            cmap=cmap,
        )
    if plane == "yz":
        print(f"Renderizando seção cruzada YZ para ({n}, {l}, {m})")
        return render_cross_section_yz(
            n,
            l,
            m,
            filename=filename,
            samples=samples,
            plane_offset=plane_offset,
            cmap=cmap,
        )
    if plane == "3d":
        return (
            render_3d(
                n,
                l,
                m,
                mode="real",
                filename=f"Backend/images/cross-section-and-3d/{n}-{l}-{m}/{n}-{l}-{m}-3d-real.png",
                cmap=cmap,
            )
            or f"Backend/images/cross-section-and-3d/{n}-{l}-{m}-3d-real.png"
        )
    raise ValueError(
        f"{Fore.RED}Visualização inválida. Use '3d', 'xz', 'xy' ou 'yz'.{Style.RESET_ALL}"
    )
