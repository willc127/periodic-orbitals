import json
import os
from datetime import datetime, timedelta
from pathlib import Path

import pytest
from pytest import MonkeyPatch

import router_isotopos
from services import elements


def test_get_elements_reuses_fresh_disk_cache(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "elements.json"
    meta_file = tmp_path / "elements.meta.json"
    expected = [{"symbol": "H"}]
    data_file.write_text(json.dumps(expected), encoding="utf-8")
    meta_file.write_text(
        json.dumps({"cached_at": datetime.now().isoformat()}), encoding="utf-8"
    )
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", meta_file)
    elements.load_elements.cache_clear()
    monkeypatch.setattr(
        elements, "_fetch_and_save", lambda: pytest.fail("unexpected refresh")
    )

    assert elements.get_elements() == expected


def test_get_elements_refreshes_expired_cache(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "elements.json"
    meta_file = tmp_path / "elements.meta.json"
    data_file.write_text("[]", encoding="utf-8")
    meta_file.write_text(
        json.dumps({"cached_at": (datetime.now() - timedelta(days=31)).isoformat()}),
        encoding="utf-8",
    )
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", meta_file)
    expected = [{"symbol": "He"}]
    monkeypatch.setattr(elements, "_fetch_and_save", lambda: expected)

    assert elements.get_elements() == expected


def test_find_element_uses_shared_cache_policy(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr(elements, "get_elements", lambda: [{"symbol": "Fe"}])

    assert elements.find_element_by_symbol("fe") == {"symbol": "Fe"}


def test_clear_elements_cache_removes_disk_files(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    data_file = tmp_path / "elements.json"
    meta_file = tmp_path / "elements.meta.json"
    data_file.write_text("[]", encoding="utf-8")
    meta_file.write_text("{}", encoding="utf-8")
    monkeypatch.setattr(elements, "ELEMENTS_FILE", data_file)
    monkeypatch.setattr(elements, "ELEMENTS_META_FILE", meta_file)

    elements.clear_elements_cache()

    assert not data_file.exists()
    assert not meta_file.exists()


def test_isotope_cache_expires_and_clear_removes_json(
    monkeypatch: MonkeyPatch, tmp_path: Path
) -> None:
    cache_file = tmp_path / "1-relevantes.json"
    cache_file.write_text("{}", encoding="utf-8")
    monkeypatch.setattr(router_isotopos, "CACHE_DIR", tmp_path)
    current_timestamp = datetime.now().timestamp()
    os.utime(cache_file, (current_timestamp, current_timestamp))

    assert router_isotopos._cache_is_valid(cache_file)
    old_timestamp = datetime.now().timestamp() - timedelta(days=31).total_seconds()
    os.utime(cache_file, (old_timestamp, old_timestamp))
    assert not router_isotopos._cache_is_valid(cache_file)

    router_isotopos.clear_isotopes_cache()

    assert not cache_file.exists()
