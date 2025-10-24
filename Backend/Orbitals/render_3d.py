import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np
import os
from hydrogen import cartesian_prob, cartesian_prob_real
from get_render_radius import get_render_radius
from colorama import Fore, Back, Style, init

init()


def render_3d(n, l, m, mode, filename=None):
    print(f"Rendering {mode} 3d model for ({n}, {l}, {m})")

    # Aumenta o raio de renderização para melhor visualização 3D
    render_radius = get_render_radius(n, l)

    # Reduz número de pontos para melhor performance
    s = 60  # resolution in each dimension

    axis_set = np.linspace(-render_radius, render_radius, s)

    # Arrays para armazenar dados
    x_data, y_data, z_data, p_data = [], [], [], []

    # Calcula probabilidades
    for x in axis_set:
        for y in axis_set:
            for z in axis_set:
                if mode == "real":
                    p = cartesian_prob_real(n, l, m, x, y, z)
                else:  # complex
                    p = cartesian_prob(n, l, m, x, y, z)

                # Só adiciona pontos com probabilidade significativa
                if p > 1e-5:  # threshold ajustável
                    p_data.append(p)
                    x_data.append(x)
                    y_data.append(y)
                    z_data.append(z)
    print("Probabilities calculated, rendering 3D scatter plot")

    # Configuração da figura com fundo preto
    fig = plt.figure(dpi=600, facecolor="black")
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor("black")

    # Normalização e colormap
    max_p = max(p_data)
    norm = mcolors.PowerNorm(gamma=0.5, vmin=0, vmax=max_p)

    # Plot com transparência baseada na probabilidade
    ax.scatter3D(
        x_data,
        y_data,
        z_data,
        c=p_data,
        cmap="magma",
        norm=norm,
        alpha=0.6,  # opacidade
        s=2,  # tamanho dos pontos
        edgecolors="none",
        depthshade=True,
    )

    # Configuração visual
    ax.set_xlabel(r"x ($a_{0}$)", color="white")
    ax.set_ylabel(r"y ($a_{0}$)", color="white")
    ax.set_zlabel(r"z ($a_{0}$)", color="white")
    ax.set_title(
        f"3D View of ({n}, {l}, {m}) {mode.capitalize()} Hydrogen Orbital",
        color="white",
        pad=20,
    )

    # Cor dos ticks e grids
    ax.tick_params(colors="white")
    for axis in [ax.xaxis, ax.yaxis, ax.zaxis]:
        axis.label.set_color("white")
        axis.line.set_color("white")

    # Remove grid e planos de fundo
    ax.grid(False)
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor("black")
    ax.yaxis.pane.set_edgecolor("black")
    ax.zaxis.pane.set_edgecolor("black")

    # Define limites e rotação
    ax.set_xlim([-render_radius, render_radius])
    ax.set_ylim([-render_radius, render_radius])
    ax.set_zlim([-render_radius, render_radius])
    ax.view_init(elev=20, azim=45)  # rotação para melhor visualização

    # Salva a figura
    print("Saving...")
    if filename is None:
        filename = f"images/{n}_{l}_{m}_{mode}_3d.png"
    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    plt.savefig(filename, dpi=600, bbox_inches="tight", facecolor="black")

    plt.close()
    print("{0}Done{1}".format(Fore.GREEN, Style.RESET_ALL))
    return filename
