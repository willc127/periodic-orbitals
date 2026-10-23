import json
import os
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from pytest import MonkeyPatch

from services import elements


def test_cache_is_invalid_without_data_file(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setattr(elements, "ELEMENTS_FILE", tmp_path / "missing.json")
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", tmp_path / "meta.json")

    assert not elements._cache_is_valid()


@pytest.mark.parametrize("meta_contents", ["{", "{}", '{"cached_at":"invalid"}'])
def test_cache_is_invalid_with_malformed_metadata(
    monkeypatch: MonkeyPatch, tmp_path: Path, meta_contents: str
) -> None:
    data_file = tmp_path / "elements.json"
    meta_file = tmp_path / "meta.json"
    data_file.write_text("[]", encoding="utf-8")
    meta_file.write_text(meta_contents, encoding="utf-8")
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", meta_file)

    assert not elements._cache_is_valid()


def test_cache_without_metadata_uses_data_file_mtime(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "elements.json"
    data_file.write_text("[]", encoding="utf-8")
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", tmp_path / "missing-meta.json")
    timestamp = datetime.now().timestamp()
    os.utime(data_file, (timestamp, timestamp))

    assert elements._cache_is_valid()


def test_load_elements_removes_embedded_spectral_lines(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "elements.json"
    data_file.write_text(
        json.dumps([{"symbol": "Fe", "spectral_lines": [{"w": 500}]}]),
        encoding="utf-8",
    )
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    elements.load_elements.cache_clear()

    assert elements.load_elements() == [{"symbol": "Fe"}]
    elements.load_elements.cache_clear()


def test_load_elements_raises_when_cache_file_is_missing(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setattr(elements, "ELEMENTS_FILE", tmp_path / "missing.json")
    elements.load_elements.cache_clear()

    with pytest.raises(FileNotFoundError):
        elements.load_elements()


def test_force_refresh_bypasses_a_valid_cache(monkeypatch: MonkeyPatch) -> None:
    expected = [{"symbol": "Ne"}]
    monkeypatch.setattr(elements, "_cache_is_valid", lambda: True)
    monkeypatch.setattr(elements, "_fetch_and_save", lambda: expected)

    assert elements.get_elements(force_refresh=True) == expected


@pytest.mark.parametrize(
    "series_id, expected",
    [(1, "Nonmetal"), (2, "Noble-Gas"), (8, "Transition-Metal"), (None, None)],
)
def test_classify_group(series_id: int | None, expected: str | None) -> None:
    assert elements._classify_group(series_id, "X") == expected


def test_classify_hydrogen_is_special_case() -> None:
    assert elements._classify_group(None, "H") == "Hydrogen"


def test_clean_for_json_replaces_non_finite_values() -> None:
    frame = pd.DataFrame({"value": [np.inf, -np.inf, np.nan, 2.5]})

    assert elements._clean_for_json(frame) == [
        {"value": None},
        {"value": None},
        {"value": None},
        {"value": 2.5},
    ]


@pytest.mark.parametrize(
    "value, expected",
    [
        ("1s2 2p6", "1s² 2p⁶"),
        (" 3d10 ", "3d¹⁰"),
        (None, None),
        (float("nan"), float("nan")),
    ],
)
def test_format_electronic_configuration(value: object, expected: object) -> None:
    actual = elements._format_electronic_configuration(value)
    if isinstance(expected, float) and np.isnan(expected):
        assert isinstance(actual, float) and np.isnan(actual)
    else:
        assert actual == expected


def test_set_image_links_handles_default_overrides_and_superheavy_elements() -> None:
    frame = pd.DataFrame(
        {
            "name": ["Gold", "Cesium", "Oganesson"],
            "atomic_number": [79, 55, 118],
        }
    )

    elements._set_image_links(frame)

    assert frame["link_image"].tolist() == [
        "https://images-of-elements.com/gold.jpg",
        "https://images-of-elements.com/caesium-3.jpg",
        "https://images-of-elements.com/s/transactinoid.png",
    ]


def test_add_protons_and_neutrons_uses_abundance_then_first_isotope(
    monkeypatch: MonkeyPatch,
) -> None:
    source_tables: dict[str, pd.DataFrame] = {
        "isotopes": pd.DataFrame(
            {
                "atomic_number": [1, 1, 6],
                "mass_number": [1, 2, 13],
                "abundance": [99.0, 1.0, np.nan],
            }
        )
    }
    monkeypatch.setattr(elements, "fetch_table", lambda name: source_tables[name])
    frame = pd.DataFrame({"atomic_number": [1, 6], "atomic_weight": [1.008, 12.011]})

    result = elements._add_protons_neutrons(frame)

    assert result["mass_number"].tolist() == [1, 13]
    assert result["protons"].tolist() == [1, 6]
    assert result["neutrons"].tolist() == [0, 7]


def test_fetch_and_save_transforms_and_persists_element_tables(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    source_tables: dict[str, pd.DataFrame] = {
        "elements": pd.DataFrame(
            [
                {
                    "symbol": "H",
                    "name": "Hydrogen",
                    "atomic_number": 1,
                    "atomic_weight": 1.008,
                    "group_id": 1,
                    "series_id": 1,
                    "period": 1,
                    "electronic_configuration": "1s1",
                },
                {
                    "symbol": "C",
                    "name": "Carbon",
                    "atomic_number": 6,
                    "atomic_weight": 12.011,
                    "group_id": 6,
                    "series_id": 6,
                    "period": 2,
                    "electronic_configuration": "1s2 2s2 2p2",
                },
                {
                    "symbol": "Sn",
                    "name": "Tin",
                    "atomic_number": 50,
                    "atomic_weight": 118.71,
                    "group_id": 14,
                    "series_id": 7,
                    "period": 5,
                    "electronic_configuration": "[Kr] 4d10 5s2 5p2",
                },
                {
                    "symbol": "La",
                    "name": "Lanthanum",
                    "atomic_number": 57,
                    "atomic_weight": 138.905,
                    "group_id": np.nan,
                    "series_id": 9,
                    "period": 6,
                    "electronic_configuration": "5d1 6s2",
                },
                {
                    "symbol": "Ac",
                    "name": "Actinium",
                    "atomic_number": 89,
                    "atomic_weight": 227,
                    "group_id": np.nan,
                    "series_id": 10,
                    "period": 7,
                    "electronic_configuration": "6d1 7s2",
                },
                {
                    "symbol": "Og",
                    "name": "Oganesson",
                    "atomic_number": 118,
                    "atomic_weight": 294,
                    "group_id": np.nan,
                    "series_id": np.nan,
                    "period": 7,
                    "electronic_configuration": None,
                },
            ]
        ),
        "phasetransitions": pd.DataFrame(
            [
                {
                    "atomic_number": number,
                    "melting_point": melting_point,
                    "boiling_point": 100.0,
                    "critical_temperature": 200.0,
                    "critical_pressure": 10.0,
                }
                for number, melting_point in [(1, 14.0), (6, 100.0), (50, 500.0)]
            ]
        ),
        "isotopes": pd.DataFrame(
            {
                "atomic_number": [1, 6, 50, 57, 89, 118],
                "mass_number": [1, 12, 120, 139, 227, 294],
                "abundance": [100.0, 98.0, np.nan, np.nan, np.nan, np.nan],
            }
        ),
    }
    data_file = tmp_path / "elements.json"
    meta_file = tmp_path / "elements.meta.json"
    monkeypatch.setattr(elements, "fetch_table", lambda name: source_tables[name])
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", meta_file)

    result = elements._fetch_and_save()
    by_symbol = {element["symbol"]: element for element in result}

    assert by_symbol["H"]["electronic_configuration"] == "1s¹"
    assert by_symbol["C"]["melting_point"] == 3915
    assert by_symbol["Sn"]["melting_point"] == 505.08
    assert by_symbol["La"]["type"] == "Lanthanide"
    assert by_symbol["La"]["group_id"] == 4
    assert by_symbol["La"]["period"] == 8
    assert by_symbol["Ac"]["type"] == "Actinide"
    assert by_symbol["Ac"]["period"] == 9
    assert by_symbol["Og"]["link_image"] == (
        "https://images-of-elements.com/s/transactinoid.png"
    )
    assert data_file.exists()
    assert meta_file.exists()
    assert json.loads(data_file.read_text(encoding="utf-8")) == result
