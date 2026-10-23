from types import SimpleNamespace
from typing import Any, cast

import pytest
from mendeleev.models import Isotope as MendeleevIsotope

from isotopos_mendeleev import (
    converter_isotopo,
    converter_isotopos_elemento,
    formatar_meia_vida,
    formatar_simbolo_isotopo,
    isotopo_e_relevante,
    modo_decaimento_principal,
)


def isotope(**overrides: Any) -> MendeleevIsotope:
    values: dict[str, object] = {
        "mass_number": 235,
        "is_stable": False,
        "abundance": None,
        "half_life": None,
        "half_life_unit": None,
        "decay_modes": [],
    }
    values.update(overrides)
    return cast(MendeleevIsotope, SimpleNamespace(**values))


def decay_mode(
    mode: str, intensity: float | None = None, relation: str | None = None
) -> SimpleNamespace:
    return SimpleNamespace(mode=mode, intensity=intensity, relation=relation)


def test_formatar_simbolo_isotopo_uses_superscript_mass() -> None:
    assert formatar_simbolo_isotopo(235, "U") == "²³⁵U"


@pytest.mark.parametrize(
    "unit, label",
    [("sec", "segundos"), ("hour", "horas"), ("unknown", "unknown")],
)
def test_formatar_meia_vida_translates_known_units_and_preserves_unknown(
    unit: str, label: str
) -> None:
    assert formatar_meia_vida(isotope(half_life=2.5, half_life_unit=unit)) == (
        f"2.5 {label}"
    )


def test_formatar_meia_vida_returns_none_when_incomplete() -> None:
    assert formatar_meia_vida(isotope(half_life=2.5)) is None
    assert formatar_meia_vida(isotope(half_life_unit="hour")) is None


def test_modo_decaimento_principal_returns_none_without_modes() -> None:
    assert modo_decaimento_principal(isotope()) is None


def test_modo_decaimento_principal_chooses_highest_intensity() -> None:
    modes = [
        decay_mode("A", intensity=10),
        decay_mode("B-", intensity=90),
    ]

    assert modo_decaimento_principal(isotope(decay_modes=modes)) == "β⁻"


def test_modo_decaimento_principal_prefers_observed_mode_without_intensities() -> None:
    modes = [
        decay_mode("A", relation="<"),
        decay_mode("EC", relation="~"),
        decay_mode("SF", relation="="),
    ]

    assert modo_decaimento_principal(isotope(decay_modes=modes)) == "captura eletrônica"


def test_modo_decaimento_principal_falls_back_to_first_mode() -> None:
    modes = [decay_mode("custom", relation="<"), decay_mode("A", relation="<")]

    assert modo_decaimento_principal(isotope(decay_modes=modes)) == "custom"


def test_isotope_relevance_keeps_stable_and_naturally_abundant_isotopes() -> None:
    assert isotopo_e_relevante(isotope(is_stable=True))
    assert isotopo_e_relevante(isotope(abundance=0.001))


@pytest.mark.parametrize(
    "half_life, unit, expected",
    [
        (1, "hour", True),
        (59, "minute", False),
        (10, "unknown", False),
        (None, None, False),
    ],
)
def test_isotope_relevance_uses_one_hour_threshold(
    half_life: float | None, unit: str | None, expected: bool
) -> None:
    assert (
        isotopo_e_relevante(isotope(half_life=half_life, half_life_unit=unit))
        is expected
    )


def test_converter_isotopo_formats_stable_and_radioactive_values() -> None:
    stable = converter_isotopo(isotope(is_stable=True, abundance=0.7), "C")
    radioactive = converter_isotopo(
        isotope(
            half_life=5730,
            half_life_unit="year",
            decay_modes=[decay_mode("B-")],
        ),
        "C",
    )

    assert stable.simboloIsotopo == "²³⁵C"
    assert stable.abundanciaNatural == 0.7
    assert stable.meiaVida is None
    assert radioactive.meiaVida == "5730 anos"
    assert radioactive.modoDecaimento == "β⁻"


def test_converter_isotopos_elemento_filters_only_when_requested() -> None:
    isotopes = [
        isotope(mass_number=12, is_stable=True),
        isotope(mass_number=13, abundance=0.01),
        isotope(mass_number=14, half_life=10, half_life_unit="minute"),
    ]

    relevant = converter_isotopos_elemento(isotopes, "C")
    all_isotopes = converter_isotopos_elemento(isotopes, "C", apenas_relevantes=False)

    assert [item.numeroMassa for item in relevant] == [12, 13]
    assert [item.numeroMassa for item in all_isotopes] == [12, 13, 14]
