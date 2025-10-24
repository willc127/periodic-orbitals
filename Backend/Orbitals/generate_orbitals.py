from typing import Optional
from render_orbital import render_orbital


def orbitals_generator(
    n: int,
    l: int,
    m: int,
    projection: str,
    plane_offset: float = 0.0,
    samples: int = 400,
    filename: Optional[str] = None,
) -> str:
    """
    Gera seção do orbital no plano projection in {"xz","xy","yz"}.
    plane_offset: deslocamento na coordenada perpendicular ao plano
      - plane='xy' -> plane_offset é z
      - plane='xz' -> plane_offset é y
      - plane='yz' -> plane_offset é x
    Retorna o caminho do arquivo gerado.
    """
    if filename is None:
        filename = f"images/{n}-{l}-{m}/{n}-{l}-{m}-cross-section-{projection}.png"
        print(f"Rendering Orbitals for ({n}, {l}, {m}) at {projection}, saving to default filename {filename}")
    return render_orbital(
        n,
        l,
        m,
        plane=projection,
        filename=filename,
        samples=samples,
        plane_offset=plane_offset,
    )


# exemplo de teste (não roda em import quando usar API; execute manualmente se quiser)
if __name__ == "__main__":
    # n = 1
    # planes = ["xz", "yz", "xy", "3d"]
    # for n in range(0, n + 1):
    #     for l in range(0, n):
    #         for m in range(-l, l + 1):
    #             for plane in planes:
    #                 plane_offset = 0.0 if plane != "xy" else 0.05
    #                 orbitals_generator(n, l, m, plane, plane_offset=plane_offset)

    orbitals_generator(3, 2, 1, "yz", plane_offset=0.05)