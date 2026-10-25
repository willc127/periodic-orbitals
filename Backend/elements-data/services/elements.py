from datetime import datetime, timedelta
from functools import lru_cache
import json
from pathlib import Path
import re
from typing import cast

import numpy as np
import pandas as pd
from mendeleev.fetch import fetch_table

DATA_DIR = Path(__file__).resolve().parents[1]
ELEMENTS_FILE = DATA_DIR / "data" / "elements-data.json"
ELEMENTS_META_FILE = DATA_DIR / "data" / "elements-data.meta.json"
TTL_DAYS = 30

IMAGE_TEMPLATES = {
    "Uranium": "s/{name}.jpg",
    "Technetium": "s/{name}.jpg",
    "Rhodium": "s/{name}.jpg",
    "Iodine": "{name}-2.jpg",
    "Aluminum": "aluminium.jpg",
    "Phosphorus": "red-{name}.jpg",
    "Tin": "{name}-2.jpg",
    "Cesium": "caesium-3.jpg",
    "Thorium": None,
    "Plutonium": "s/{name}.jpg",
    "Americium": "s/{name}.jpg",
    "Neptunium": "s/{name}.jpg",
    "Einsteinium": "s/{name}-253.jpg",
    "Californium": "s/{name}-disc.jpg",
    "Fermium": "s/{name}.jpg",
    "Mendelevium": "s/{name}.jpg",
    "Rutherfordium": "s/{name}.jpg",
}
ELEMENT_PAGE_SLUGS = {"Aluminum": "aluminium", "Cesium": "caesium"}


def _cache_is_valid() -> bool:
    if not ELEMENTS_FILE.exists():
        return False
    if not ELEMENTS_META_FILE.exists():
        cached_at = datetime.fromtimestamp(ELEMENTS_FILE.stat().st_mtime)
        return datetime.now() - cached_at < timedelta(days=TTL_DAYS)

    try:
        meta = json.loads(ELEMENTS_META_FILE.read_text(encoding="utf-8"))
        cached_at = datetime.fromisoformat(meta["cached_at"])
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return False
    return datetime.now() - cached_at < timedelta(days=TTL_DAYS)


def _write_meta() -> None:
    ELEMENTS_META_FILE.write_text(
        json.dumps({"cached_at": datetime.now().isoformat()}, indent=2),
        encoding="utf-8",
    )


@lru_cache(maxsize=1)
def load_elements() -> list[dict[str, object]]:
    if not ELEMENTS_FILE.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {ELEMENTS_FILE}")

    elements: list[dict[str, object]] = json.loads(
        ELEMENTS_FILE.read_text(encoding="utf-8")
    )
    image_links_updated = False
    for element in elements:
        element.pop("spectral_lines", None)
        name = element.get("name")
        symbol = element.get("symbol")
        atomic_number = element.get("atomic_number")
        if (
            isinstance(name, str)
            and isinstance(symbol, str)
            and isinstance(atomic_number, int)
        ):
            local_image_path = _local_image_path(symbol, atomic_number, name)
            image_source_url = _image_page_url(name)
            if (
                element.get("link_image") != local_image_path
                or element.get("link_image_source") != image_source_url
            ):
                image_links_updated = True
                element["link_image"] = local_image_path
                element["link_image_source"] = image_source_url
    if image_links_updated:
        ELEMENTS_FILE.write_text(
            json.dumps(elements, indent=2, ensure_ascii=False), encoding="utf-8"
        )
    return elements


def find_element_by_symbol(symbol: str) -> dict[str, object] | None:
    normalized_symbol = symbol.strip().capitalize()
    return next(
        (
            element
            for element in get_elements()
            if element.get("symbol") == normalized_symbol
        ),
        None,
    )


def get_elements(force_refresh: bool = False) -> list[dict[str, object]]:
    if not force_refresh and _cache_is_valid():
        return load_elements()
    return _fetch_and_save()


def clear_elements_cache() -> None:
    load_elements.cache_clear()
    ELEMENTS_FILE.unlink(missing_ok=True)
    ELEMENTS_META_FILE.unlink(missing_ok=True)


def _clean_for_json(df: pd.DataFrame) -> list[dict[str, object]]:
    df = df.copy()
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(pd.notnull(df), None)
    return cast(list[dict[str, object]], df.to_dict(orient="records"))


def _add_protons_neutrons(df: pd.DataFrame) -> pd.DataFrame:
    df_iso = fetch_table("isotopes")

    com_abundancia = df_iso[df_iso["abundance"].notnull()]
    mais_abundante = com_abundancia.sort_values(
        "abundance", ascending=False
    ).drop_duplicates(subset=["atomic_number"], keep="first")[
        [
            "atomic_number",
            "mass_number",
        ]
    ]
    primeiro_isotopo = df_iso.drop_duplicates(subset=["atomic_number"], keep="first")[
        [
            "atomic_number",
            "mass_number",
        ]
    ].set_index("atomic_number")["mass_number"]

    df = df.merge(mais_abundante, on="atomic_number", how="left")
    df["mass_number"] = df["mass_number"].fillna(
        df["atomic_number"].map(primeiro_isotopo)
    )
    df["mass_number"] = df["mass_number"].fillna(df["atomic_weight"].astype(int))
    df["mass_number"] = df["mass_number"].astype(int)
    df["protons"] = df["atomic_number"]
    df["neutrons"] = df["mass_number"] - df["protons"]
    return df


def _classify_group(series_id: int | None, symbol: str) -> str | None:
    if symbol == "H":
        return "Hydrogen"
    if series_id is None:
        return None
    return {
        1: "Nonmetal",
        2: "Noble-Gas",
        3: "Alkali-Metal",
        4: "Alkaline-Earth-Metal",
        5: "Metalloid",
        6: "Halogen",
        7: "Poor-Metal",
        8: "Transition-Metal",
        9: "Lanthanide",
        10: "Actinide",
    }.get(series_id)


def _source_image_url(name: str, atomic_number: int) -> str | None:
    if atomic_number >= 104:
        image_path = "s/transactinoid.png"
    else:
        template = IMAGE_TEMPLATES.get(name, "{name}.jpg")
        if template is None:
            return None
        image_path = template.format(name=name.lower())
    return f"https://images-of-elements.com/{image_path}"


def _image_page_url(name: str) -> str:
    slug = ELEMENT_PAGE_SLUGS.get(name, name.lower())
    return f"https://images-of-elements.com/{slug}.php"


def _local_image_path(symbol: str, atomic_number: int, name: str) -> str | None:
    if name in IMAGE_TEMPLATES and IMAGE_TEMPLATES[name] is None:
        return None
    if atomic_number >= 104:
        filename = "transactinoid.png"
    else:
        filename = f"{symbol.lower()}.jpg"
    return f"/assets/elements/{filename}"


def _set_image_links(df: pd.DataFrame) -> None:
    df["link_image"] = [
        _local_image_path(str(symbol), int(atomic_number), str(name))
        for symbol, atomic_number, name in zip(
            df["symbol"], df["atomic_number"], df["name"], strict=True
        )
    ]
    df["link_image_source"] = df["name"].apply(lambda name: _image_page_url(str(name)))


def _format_electronic_configuration(value: object) -> object:
    if not isinstance(value, str):
        return value

    superscript_map = str.maketrans(
        {
            "0": "⁰",
            "1": "¹",
            "2": "²",
            "3": "³",
            "4": "⁴",
            "5": "⁵",
            "6": "⁶",
            "7": "⁷",
            "8": "⁸",
            "9": "⁹",
        }
    )

    def to_superscript(match: re.Match[str]) -> str:
        exponent = (match.group(3) or "1").translate(superscript_map)
        return f"{match.group(1)}{match.group(2)}{exponent}"

    normalized = re.sub(r"\s+", " ", str(value)).strip()
    return re.sub(r"(\d+)([spdfg])(\d*)", to_superscript, normalized)


def _fetch_and_save() -> list[dict[str, object]]:
    df = fetch_table("elements")
    df_phases = fetch_table("phasetransitions")
    df = _add_protons_neutrons(df)

    desired_columns = [
        "symbol",
        "name",
        "atomic_number",
        "atomic_weight",
        "group_id",
        "series_id",
        "period",
        "electronic_configuration",
        "description",
        "abundance_crust",
        "abundance_sea",
        "density",
        "atomic_radius",
        "uses",
        "en_pauling",
        "thermal_conductivity",
        "specific_heat_capacity",
        "molar_heat_capacity",
        "is_radioactive",
        "geochemical_class",
        "evaporation_heat",
        "fusion_heat",
        "cas",
        "sources",
        "discoverers",
        "discovery_location",
        "discovery_year",
        "name_origin",
        "protons",
        "neutrons",
    ]
    df = df[[column for column in desired_columns if column in df.columns]]

    phase_columns = [
        "atomic_number",
        "melting_point",
        "boiling_point",
        "critical_temperature",
        "critical_pressure",
    ]
    df_phases = df_phases[phase_columns].drop_duplicates(subset=["atomic_number"])
    df = df.merge(df_phases, on="atomic_number", how="left")
    df["series_id"] = df["series_id"].fillna(0).astype(int)
    df.loc[df["atomic_number"] == 50, "melting_point"] = 505.08
    df.loc[df["atomic_number"] == 6, "melting_point"] = 3915

    df["type"] = df.apply(
        lambda row: _classify_group(row["series_id"], row["symbol"]), axis=1
    )
    df["link"] = df["atomic_number"].apply(
        lambda number: f"http://www.periodicvideos.com/videos/{int(number):03d}.htm"
    )
    df["link_nist"] = df["symbol"].apply(
        lambda symbol: f"https://physics.nist.gov/cgi-bin/ASD/lines1.pl?spectra={symbol}&output_type=0&low_w=&upp_w=&unit=1&submit=Retrieve+Data&de=0&plot_out=0&I_scale_type=1&format=0&line_out=0&en_unit=0&output=0&bibrefs=1&page_size=15&show_obs_wl=1&show_calc_wl=1&unc_out=1&order_out=0&max_low_enrg=&show_av=2&max_upp_enrg=&tsb_value=0&min_str=&A_out=0&intens_out=on&max_str=&allowed_out=1&forbid_out=1&min_accur=&min_intens=&conf_out=on&term_out=on&enrg_out=on&J_out=on"
    )
    _set_image_links(df)
    df["electronic_configuration"] = df["electronic_configuration"].map(
        _format_electronic_configuration
    )

    for atomic_number, element_type in {
        57: "Lanthanide",
        71: "Lanthanide",
        89: "Actinide",
        103: "Actinide",
    }.items():
        df.loc[df["atomic_number"] == atomic_number, "type"] = element_type

    for element_type, first_atomic_number, period in [
        ("Lanthanide", 57, 8),
        ("Actinide", 89, 9),
    ]:
        mask = (df["group_id"].isnull() & (df["type"] == element_type)) | (
            df["atomic_number"] == first_atomic_number
        )
        if mask.any():
            for group_id, index in enumerate(df.index[mask], start=4):
                df.at[index, "group_id"] = group_id
            df.loc[mask, "period"] = period

    elements = _clean_for_json(df)
    ELEMENTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ELEMENTS_FILE.write_text(
        json.dumps(elements, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    _write_meta()
    load_elements.cache_clear()
    return elements
