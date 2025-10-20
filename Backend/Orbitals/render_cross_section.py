import os
import matplotlib.pyplot as plt
import matplotlib.colors as colors
from hydrogen import cartesian_prob
from get_render_radius import get_render_radius


def render_cross_section(n: int, l: int, m: int, filename: str = 'None') -> str:
    print(
        "Rendering cross section for (" + str(n) + ", " + str(l) + ", " + str(m) + ")"
    )
    render_radius = get_render_radius(n, l)

    # width and height in number of steps
    s: int = 400

    # step = size of pixel in a_0
    step: float = 2 * render_radius / s

    # grid to render
    arr: list[list[float]] = []

    print("Calculating probabilities")
    arr: list[list[float]] = [
        [
            cartesian_prob(
                n, l, m, (float(x) - s / 2) * step, 0, (float(z) - s / 2) * step
            )
            for x in range(s + 1)
        ]
        for z in range(s + 1)
    ]

    # set resolution and aspect ratio

    print("Rendering figure")
    plt.figure(dpi=600)

    # heat map
    plt.imshow(
        arr,
        cmap="magma",
        interpolation="nearest",
        extent=[-render_radius, render_radius, -render_radius, render_radius], # type: ignore
        norm=colors.PowerNorm(1 / 3),
    )

    # labels and title
    plt.xlabel(r"x ($a_{0}$)")
    plt.ylabel(r"z ($a_{0}$)")
    plt.title(
        "XZ Plane Cross Section of a ("
        + str(n)
        + ", "
        + str(l)
        + ", "
        + str(m)
        + ") Hydrogen Orbital"
    )

    # save
    print("Saving")
    if filename == 'None':
        filename = f"cross_{n}_{l}_{m}.png"
    os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
    plt.savefig(filename, dpi=600, bbox_inches="tight")

    # close
    print("Closing")
    plt.close()
    print("Done")
    return filename
