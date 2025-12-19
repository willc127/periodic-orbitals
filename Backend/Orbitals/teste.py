from generator import orbitals_generator
from helpers import check_and_group_orbital

orbitals_generator(6, 3, 1, "xy", cmap="plasma")
orbitals_generator(6, 3, 1, "xz", cmap="plasma")
orbitals_generator(6, 3, 1, "yz", cmap="plasma")
orbitals_generator(6, 3, 1, "3d", cmap="plasma")
check_and_group_orbital(6, 3, 1, "Backend/images")