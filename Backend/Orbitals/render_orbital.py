from save_figure import save_figure
from typing import Optional

from render_3d import render_3d
from hydrogen import cartesian_prob_real
from get_render_radius import get_render_radius
import numpy as np

from colorama import Fore, Back, Style, init
init()


def render_cross_section_xz(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,  # offset em y (y = plane_offset)
) -> str:
    """
    Seção XZ (y = plane_offset). Retorna o caminho do arquivo salvo.

    """
    render_radius = get_render_radius(n, l)
    # aumenta os eixos
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

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
    arr = np.asarray(arr, dtype=float)
    print(f"XZ: {n}-{l}-{m} {Fore.GREEN}Done{Style.RESET_ALL}")

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-xz.png"

    title = f"XZ Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    save_figure(arr, render_radius_eff, r"x ($a_{0}$)", r"z ($a_{0}$)", title, filename)
    return filename


def render_cross_section_xy(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,  # offset em z (z = plane_offset)
) -> str:
    """
    Seção XY (z = plane_offset). Retorna o caminho do arquivo salvo.

    """
    render_radius = get_render_radius(n, l)
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

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
    arr = np.asarray(arr, dtype=float)
    print(f"XY: {n}-{l}-{m} {Fore.GREEN}Done{Style.RESET_ALL}")

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-xy.png"

    title = f"XY Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    save_figure(arr, render_radius_eff, r"x ($a_{0}$)", r"y ($a_{0}$)", title, filename)
    return filename


def render_cross_section_yz(
    n: int,
    l: int,
    m: int,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,  # offset em x (x = plane_offset)
) -> str:
    """
    Seção YZ (x = plane_offset). Retorna o caminho do arquivo salvo.
 
    """
    render_radius = get_render_radius(n, l)
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

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
    arr = np.asarray(arr, dtype=float)
    print(f"YZ: {n}-{l}-{m} {Fore.GREEN}Done{Style.RESET_ALL}")

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-yz.png"

    title = f"YZ Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    save_figure(arr, render_radius_eff, r"y ($a_{0}$)", r"z ($a_{0}$)", title, filename)
    return filename


def render_orbital(
    n: int,
    l: int,
    m: int,
    plane: str,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,  # offset aplicado perpendicular ao plano
) -> str:
    """
    Dispatcher: plane in {"xz", "xy", "yz"}.
    plane_offset: se plane='xy', offset é z; se 'xz' offset é y; se 'yz' offset é x.
    """
    plane = plane.lower()
    if plane == "xz":
        print(f"Rendering XZ cross section for ({n}, {l}, {m})")
        return render_cross_section_xz(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    if plane == "xy":
        return render_cross_section_xy(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    if plane == "yz":
        print(f"Rendering YZ cross section for ({n}, {l}, {m})")
        return render_cross_section_yz(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    if plane == "3d":
        return render_3d(
            n, l, m, mode="real", filename=f"images/{n}-{l}-{m}/{n}-{l}-{m}-3d-real.png"
        )
    raise ValueError("{0}Invalid plane. Use 'xz', 'xy' or 'yz'.".format(Fore.RED))
