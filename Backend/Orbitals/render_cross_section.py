import os
import matplotlib.pyplot as plt
import matplotlib.colors as colors
from typing import Optional

# usa os mesmos helpers que você já tem no projeto
from hydrogen import cartesian_prob
from get_render_radius import get_render_radius
import numpy as np


def _save_figure(
    arr, render_radius: float, xlabel: str, ylabel: str, title: str, filename: str
) -> None:
    import matplotlib as mpl
    from matplotlib import cm as mpl_cm
    import matplotlib.colors as mcolors

    # garante numpy array
    arr = np.asarray(arr, dtype=float)

    # cria figura com fundo preto
    fig, ax = plt.subplots(dpi=600, facecolor="black")
    ax.set_facecolor("black")

    # valores para normalização
    vmax = float(arr.max()) if arr.size > 0 else 1.0
    positive = arr[arr > 0]
    vposmin = float(positive.min()) if positive.size > 0 else vmax * 1e-6
    # define um threshold pequeno para considerar "fundo"
    thresh = max(vposmin * 0.5, vmax * 1e-9, 1e-22)

    # escolha de normalização (LogNorm quando houver grande dinâmica)
    use_log = (vmax / max(vposmin, 1e-300)) > 1e3 and positive.size > 0
    if use_log and positive.size > 0:
        norm = colors.LogNorm(vmin=max(thresh, vposmin), vmax=vmax)
    else:
        norm = colors.PowerNorm(1 / 3, vmin=thresh, vmax=vmax if vmax > 0 else 1.0)

    # prepara colormap e garante cor "under" (valores < vmin) preta
    base_cmap = mpl_cm.get_cmap("magma")
    try:
        cmap = base_cmap
        cmap.set_under("black")
    except Exception:
        cmap_vals = base_cmap(np.linspace(0, 1, getattr(base_cmap, "N", 256)))
        cmap = mcolors.ListedColormap(list(cmap_vals))
        cmap.set_under("black")

    ax.imshow(
        arr,
        cmap=cmap,
        interpolation="nearest",
        extent=[-render_radius, render_radius, -render_radius, render_radius],  # type: ignore
        norm=norm,
        origin="lower",
        aspect="equal",
    )

    # labels e título em branco para aparecer no fundo preto
    ax.set_xlabel(xlabel, color="white")
    ax.set_ylabel(ylabel, color="white")
    ax.set_title(title, color="white")
    ax.tick_params(colors="white", which="both")
    for spine in ax.spines.values():
        spine.set_edgecolor("white")

    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    fig.savefig(filename, bbox_inches="tight", facecolor="black")
    plt.close(fig)


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
    Eixos aumentados internamente em 15%.
    """
    render_radius = get_render_radius(n, l)
    # aumenta os eixos em 15% internamente
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

    # linhas -> z, colunas -> x (horizontal = x, vertical = z)
    arr = [
        [
            cartesian_prob(
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
    print("XZ min/max:", float(arr.min()), float(arr.max()))

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-xz.png"

    title = f"XZ Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    _save_figure(
        arr, render_radius_eff, r"x ($a_{0}$)", r"z ($a_{0}$)", title, filename
    )
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
    Eixos aumentados internamente em 15%.
    """
    render_radius = get_render_radius(n, l)
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

    # linhas -> y, colunas -> x (horizontal = x, vertical = y)
    arr = [
        [
            cartesian_prob(
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
    print("XY min/max:", float(arr.min()), float(arr.max()))

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-xy.png"

    title = f"XY Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    _save_figure(
        arr, render_radius_eff, r"x ($a_{0}$)", r"y ($a_{0}$)", title, filename
    )
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
    Eixos aumentados internamente em 15%.
    """
    render_radius = get_render_radius(n, l)
    render_radius_eff = render_radius * 3.5
    s = samples
    step = 2 * render_radius_eff / s

    # linhas -> z, colunas -> y (horizontal = y, vertical = z)
    arr = [
        [
            cartesian_prob(
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
    print("YZ min/max:", float(arr.min()), float(arr.max()))

    if not filename:
        filename = f"images/{n}-{l}-{m}-cross-section-yz.png"

    title = f"YZ Plane Cross Section of a ({n}, {l}, {m}) Hydrogen Orbital"
    _save_figure(
        arr, render_radius_eff, r"y ($a_{0}$)", r"z ($a_{0}$)", title, filename
    )
    return filename


def render_cross_section(
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
        return render_cross_section_xz(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    if plane == "xy":
        return render_cross_section_xy(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    if plane == "yz":
        return render_cross_section_yz(
            n, l, m, filename=filename, samples=samples, plane_offset=plane_offset
        )
    raise ValueError("Invalid plane. Use 'xz', 'xy' or 'yz'.")
