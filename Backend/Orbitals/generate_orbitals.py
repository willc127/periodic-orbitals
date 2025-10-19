from render_cross_section import render_cross_section


def orbitals_generator(n: int, l: int, m: int) -> str:

    return render_cross_section(
        n, l, m, f"Orbitals/images/{n}-{l}-{m}-cross-section.png"
    )

