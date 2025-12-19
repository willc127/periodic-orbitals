import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np
import os
from hydrogen import cartesian_prob, cartesian_prob_real
from get_render_radius import get_render_radius
from colorama import Fore, Back, Style, init

init()


def render_3d(n, l, m, mode, filename=None, cmap="magma"):
    print(f"Renderizando modelo 3D {mode} para ({n}, {l}, {m})")

    # Calcula o raio de renderização e aplica multiplicadores
    # para manter consistência com as projeções 2D e evitar cortes
    render_radius = get_render_radius(n, l)

    # Define limites e resolução (multiplicadores alinhados com render_orbital.py)
    match n:
        case 1:
            render_radius_eff = render_radius * 3.0
            s = 100  # resolution in each dimension
        case 2:
            render_radius_eff = render_radius * 3.0
            s = 100
        case 3:
            render_radius_eff = render_radius * 2.0
            s = 100
        case 4:
            render_radius_eff = render_radius * 2.0
            s = 120
        case 5:
            render_radius_eff = render_radius * 1.5
            s = 150
        case 6:
            render_radius_eff = render_radius * 1.5
            s = 150
        case 7:
            render_radius_eff = render_radius * 1.5
            s = 150
        case _:
            render_radius_eff = render_radius * 1.0
            s = 150
    axis_set = np.linspace(-render_radius_eff, render_radius_eff, s)

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
                p_threshold = 1e-9
                if p > p_threshold:  # threshold ajustável
                    p_data.append(p)
                    x_data.append(x)
                    y_data.append(y)
                    z_data.append(z)

    # Configuração da figura com fundo preto
    fig = plt.figure(dpi=600, facecolor="black")
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor("black")

    # Normalização e colormap
    if len(p_data) == 0:
        print("Nenhum ponto foi gerado com o threshold atual.")
        return None

    max_p = max(p_data)
    norm = mcolors.PowerNorm(gamma=0.5, vmin=0, vmax=max_p)

    # Ajusta visibilidade dos pontos para melhor correspondência visual
    # com as projeções 2D
    point_alpha = 0.02
    point_size = 10

    # Plot com transparência baseada na probabilidade
    ax.scatter3D(
        x_data,
        y_data,
        z_data,
        c=p_data,
        cmap=cmap,
        norm=norm,
        alpha=point_alpha,  # opacidade
        s=point_size,  # tamanho dos pontos
        edgecolors="none",
        depthshade=True,
    )

    # Configuração visual
    ax.set_xlabel(r"x ($a_{0}$)", color="white")
    ax.set_ylabel(r"y ($a_{0}$)", color="white")
    ax.set_zlabel(r"z ($a_{0}$)", color="white")
    ax.set_title(
        f"Visão 3D do Orbital de Hidrogênio ({n}, {l}, {m}) {mode.capitalize()}",
        color="white",
    )

    # Reduce label padding so axes are closer to the plot edges
    ax.xaxis.labelpad = 2
    ax.yaxis.labelpad = 2
    ax.zaxis.labelpad = 2

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
    ax.set_xlim([-render_radius_eff, render_radius_eff])
    ax.set_ylim([-render_radius_eff, render_radius_eff])
    ax.set_zlim([-render_radius_eff, render_radius_eff])
    ax.set_box_aspect([1, 1, 1])  # mantém o cubo proporcional
    ax.invert_xaxis()  # inverte o eixo x para melhor visualização
    ax.view_init(elev=30, azim=60)  # rotação para melhor visualização

    # Ajusta posicionamento para reduzir margens em torno do axes
    fig.subplots_adjust(left=0.02, right=0.98, top=1, bottom=0.02)
    ax.set_position([0.01, 0.01, 0.98, 0.98])

    # Salva a figura com mínimo padding (bbox_inches='tight' e pad_inches=0)
    print("Salvando...")
    if filename is None:
        filename = f"images/{n}_{l}_{m}_{mode}_3d.png"
    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    plt.savefig(filename, dpi=600, facecolor="black", bbox_inches="tight", pad_inches=0.1)
    plt.close()
    print("{0}Concluído{1}\n".format(Fore.WHITE, Back.GREEN, Style.RESET_ALL))
    return filename
