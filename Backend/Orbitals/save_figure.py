import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors

def save_figure(
    arr, render_radius: float, xlabel: str, ylabel: str, title: str, filename: str, cmap = "magma"
) -> None:
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
    base_cmap = mpl_cm.get_cmap(cmap)
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