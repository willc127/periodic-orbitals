from generator import orbitals_generator
from helpers import check_and_group_orbital

problematic_orbitals = [
    (1,0,0),

]

for n, l, m in problematic_orbitals:
    orbitals_generator(n, l, m, "xy", cmap="plasma")
    # orbitals_generator(n, l, m, "xz", cmap="plasma")
    # orbitals_generator(n, l, m, "yz", cmap="plasma")
    # orbitals_generator(n, l, m, "3d", cmap="plasma")
    check_and_group_orbital(n, l, m, "Backend/images")