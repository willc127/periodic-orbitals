import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from pytest import MonkeyPatch

import router_isotopos

CACHED_RESPONSE = {
    "numeroAtomico": 26,
    "simboloElemento": "Fe",
    "nomeElemento": "Iron",
    "isotopos": [],
}


def setup_cache(monkeypatch: MonkeyPatch, tmp_path: Path) -> Path:
    monkeypatch.setattr(router_isotopos, "CACHE_DIR", tmp_path)
    return tmp_path / "26-relevantes.json"


def test_route_returns_valid_cached_isotopes(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    cache_file = setup_cache(monkeypatch, tmp_path)
    cache_file.write_text(json.dumps(CACHED_RESPONSE), encoding="utf-8")
    monkeypatch.setattr(router_isotopos, "_cache_is_valid", lambda path: True)
    monkeypatch.setattr(
        router_isotopos,
        "mendeleev_element",
        lambda number: pytest.fail("unexpected database query"),
    )

    result = router_isotopos.obter_isotopos(
        26, apenas_relevantes=True, force_refresh=False
    )

    assert result.model_dump() == CACHED_RESPONSE


def test_route_recomputes_corrupted_cache_and_overwrites_file(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    cache_file = setup_cache(monkeypatch, tmp_path)
    cache_file.write_text("not json", encoding="utf-8")
    monkeypatch.setattr(router_isotopos, "_cache_is_valid", lambda path: True)
    element = SimpleNamespace(atomic_number=26, symbol="Fe", name="Iron", isotopes=[])
    monkeypatch.setattr(router_isotopos, "mendeleev_element", lambda number: element)
    monkeypatch.setattr(
        router_isotopos, "converter_isotopos_elemento", lambda *args: []
    )

    result = router_isotopos.obter_isotopos(
        26, apenas_relevantes=True, force_refresh=False
    )

    assert result.model_dump() == CACHED_RESPONSE
    assert json.loads(cache_file.read_text(encoding="utf-8")) == CACHED_RESPONSE


def test_force_refresh_bypasses_valid_cache(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    cache_file = setup_cache(monkeypatch, tmp_path)
    cache_file.write_text(json.dumps(CACHED_RESPONSE), encoding="utf-8")
    calls: list[int] = []
    element = SimpleNamespace(atomic_number=26, symbol="Fe", name="Iron", isotopes=[])
    monkeypatch.setattr(
        router_isotopos,
        "mendeleev_element",
        lambda number: calls.append(number) or element,
    )
    monkeypatch.setattr(
        router_isotopos, "converter_isotopos_elemento", lambda *args: []
    )

    router_isotopos.obter_isotopos(26, force_refresh=True)

    assert calls == [26]


def test_route_rejects_invalid_atomic_number() -> None:
    with pytest.raises(HTTPException) as error:
        router_isotopos.obter_isotopos(0)

    assert error.value.status_code == 404
    assert error.value.detail == "Número atômico inválido."


def test_route_maps_missing_element_to_404(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    setup_cache(monkeypatch, tmp_path)
    monkeypatch.setattr(
        router_isotopos,
        "mendeleev_element",
        lambda number: (_ for _ in ()).throw(ValueError("not found")),
    )

    with pytest.raises(HTTPException) as error:
        router_isotopos.obter_isotopos(26, apenas_relevantes=True, force_refresh=False)

    assert error.value.status_code == 404
    assert error.value.detail == "Elemento não encontrado."
