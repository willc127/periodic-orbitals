import json
from functools import lru_cache
from pathlib import Path

SPECTRA_FILE = (
    Path(__file__).resolve().parents[2]
    / "spectra_lines"
    / "data"
    / "spectral_lines.json"
)


@lru_cache(maxsize=1)
def _load_spectra() -> dict[str, list[dict[str, int | float]]]:
    if not SPECTRA_FILE.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {SPECTRA_FILE}")
    return json.loads(SPECTRA_FILE.read_text(encoding="utf-8"))


def get_spectral_lines(symbol: str) -> list[dict[str, int | float]]:
    return _load_spectra().get(symbol, [])


def clear_spectra_cache() -> None:
    _load_spectra.cache_clear()
