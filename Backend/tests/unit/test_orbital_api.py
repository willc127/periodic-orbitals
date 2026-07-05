from Backend.orbitals_generation.api import psi_real_at_cartesian


def test_psi_real_at_cartesian_respects_opposite_signs_along_pz_axis() -> None:
    positive_z = psi_real_at_cartesian(2, 1, 0, 0.0, 0.0, 1.0)
    negative_z = psi_real_at_cartesian(2, 1, 0, 0.0, 0.0, -1.0)

    assert positive_z > 0
    assert negative_z < 0
