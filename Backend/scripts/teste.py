"""Test script for problematic orbital rendering."""

import sys
from pathlib import Path

# Adicionar Backend ao path para permitir imports absolutos
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from scripts.generator import orbitals_generator
from utils.helpers import check_and_group_orbital

# Lista de orbitais problemáticos conhecidos
problematic_orbitals = [
    (1, 0, 0),
]

for n, l, m in problematic_orbitals:
    orbitals_generator(n, l, m, "xy", cmap="plasma")
    orbitals_generator(n, l, m, "xz", cmap="plasma")
    orbitals_generator(n, l, m, "yz", cmap="plasma")
    orbitals_generator(n, l, m, "3d", cmap="plasma")
    check_and_group_orbital(n, l, m, "Backend/images/cross-section-and-3d/")
