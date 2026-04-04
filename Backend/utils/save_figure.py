"""Figure saving utilities."""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors


def save_figure(
    arr: np.ndarray,
    render_radius: float,
    xlabel: str,
    ylabel: str,
    title: str,
    filename: str,
    cmap: str = "magma",
) -> None:
    """
    Salva uma figura 2D com colormap apropriado.

    Args:
        arr: Array 2D com os dados de probabilidade
        render_radius: Raio de renderização em unidades de Bohr
        xlabel: Rótulo do eixo X
        ylabel: Rótulo do eixo Y
        title: Título da figura
        filename: Caminho para salvar a imagem
        cmap: Nome do colormap a usar
    """
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
        cmap_obj = base_cmap
        cmap_obj.set_under("black")
    except Exception:
        cmap_vals = base_cmap(np.linspace(0, 1, getattr(base_cmap, "N", 256)))
        cmap_obj = mcolors.ListedColormap(list(cmap_vals))
        cmap_obj.set_under("black")

    ax.imshow(
        arr,
        cmap=cmap_obj,
        interpolation="nearest",
        extent=(-render_radius, render_radius, -render_radius, render_radius),
        norm=norm,
        origin="lower",
        aspect="equal",
    )

    # Configuração dos labels
    ax.set_xlabel(xlabel, color="white", fontsize=14)
    ax.set_ylabel(ylabel, color="white", fontsize=14)
    ax.set_title(title, color="white", fontsize=16)

    # Cores dos ticks e spines
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("white")
        spine.set_linewidth(1.5)

    # Salva a figura
    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    plt.savefig(
        filename, dpi=600, facecolor="black", bbox_inches="tight", pad_inches=0.1
    )
    plt.close()
