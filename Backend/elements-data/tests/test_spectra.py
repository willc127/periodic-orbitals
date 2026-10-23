import json
from pathlib import Path
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from pytest import MonkeyPatch

from api import cache as cache_api
from api import spectra as spectra_api
from services import spectra


def test_spectral_lines_are_cached_until_cleared(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "spectral_lines.json"
    first_data = {"Fe": [{"w": 500.0, "i": 100}]}
    second_data = {"Fe": [{"w": 600.0, "i": 80}]}
    data_file.write_text(json.dumps(first_data), encoding="utf-8")
    monkeypatch.setattr(spectra, "SPECTRA_FILE", data_file)
    spectra.clear_spectra_cache()

    assert spectra.get_spectral_lines("Fe") == first_data["Fe"]

    data_file.write_text(json.dumps(second_data), encoding="utf-8")
    assert spectra.get_spectral_lines("Fe") == first_data["Fe"]

    spectra.clear_spectra_cache()
    assert spectra.get_spectral_lines("Fe") == second_data["Fe"]
    spectra.clear_spectra_cache()


def test_spectral_lines_returns_empty_list_for_unknown_symbol(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "spectral_lines.json"
    data_file.write_text(json.dumps({"Fe": []}), encoding="utf-8")
    monkeypatch.setattr(spectra, "SPECTRA_FILE", data_file)
    spectra.clear_spectra_cache()

    assert spectra.get_spectral_lines("Xe") == []
    spectra.clear_spectra_cache()


def test_spectral_lines_missing_file_raises(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setattr(spectra, "SPECTRA_FILE", tmp_path / "missing.json")
    spectra.clear_spectra_cache()

    with pytest.raises(FileNotFoundError):
        spectra.get_spectral_lines("Fe")

    spectra.clear_spectra_cache()


def test_spectra_route_returns_normalized_element_and_lines(
    monkeypatch: MonkeyPatch,
) -> None:
    lines = [{"w": 500.0, "i": 100}]
    monkeypatch.setattr(
        spectra_api, "find_element_by_symbol", lambda symbol: {"symbol": "Fe"}
    )
    monkeypatch.setattr(spectra_api, "get_spectral_lines", lambda symbol: lines)

    assert spectra_api.obter_linhas_espectrais("fe") == {
        "symbol": "Fe",
        "spectral_lines": lines,
    }


def test_spectra_route_returns_404_for_unknown_element(
    monkeypatch: MonkeyPatch,
) -> None:
    monkeypatch.setattr(spectra_api, "find_element_by_symbol", lambda symbol: None)

    with pytest.raises(HTTPException) as error:
        spectra_api.obter_linhas_espectrais("xe")

    assert error.value.status_code == 404
    assert error.value.detail == "Elemento 'Xe' não encontrado"


def test_cache_clear_route_clears_each_cache(monkeypatch: MonkeyPatch) -> None:
    clear_elements = Mock()
    clear_spectra = Mock()
    clear_isotopes = Mock()
    monkeypatch.setattr(cache_api, "clear_elements_cache", clear_elements)
    monkeypatch.setattr(cache_api, "clear_spectra_cache", clear_spectra)
    monkeypatch.setattr(cache_api, "clear_isotopes_cache", clear_isotopes)

    response = cache_api.limpar_cache()

    assert response == {"message": "Caches em memória e em disco limpos"}
    clear_elements.assert_called_once_with()
    clear_spectra.assert_called_once_with()
    clear_isotopes.assert_called_once_with()
