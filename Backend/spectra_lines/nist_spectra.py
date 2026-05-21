import json
import time
import argparse
import math
import warnings
import astropy.units as u
from astroquery.nist import Nist
from typing import cast
from astropy.table import Table

warnings.filterwarnings("ignore")

ALL_ELEMENTS = [
    "H",
    "He",
    "Li",
    "Be",
    "B",
    "C",
    "N",
    "O",
    "F",
    "Ne",
    "Na",
    "Mg",
    "Al",
    "Si",
    "P",
    "S",
    "Cl",
    "Ar",
    "K",
    "Ca",
    "Sc",
    "Ti",
    "V",
    "Cr",
    "Mn",
    "Fe",
    "Co",
    "Ni",
    "Cu",
    "Zn",
    "Ga",
    "Ge",
    "As",
    "Se",
    "Br",
    "Kr",
    "Rb",
    "Sr",
    "Y",
    "Zr",
    "Nb",
    "Mo",
    "Tc",
    "Ru",
    "Rh",
    "Pd",
    "Ag",
    "Cd",
    "In",
    "Sn",
    "Sb",
    "Te",
    "I",
    "Xe",
    "Cs",
    "Ba",
    "La",
    "Ce",
    "Pr",
    "Nd",
    "Pm",
    "Sm",
    "Eu",
    "Gd",
    "Tb",
    "Dy",
    "Ho",
    "Er",
    "Tm",
    "Yb",
    "Lu",
    "Hf",
    "Ta",
    "W",
    "Re",
    "Os",
    "Ir",
    "Pt",
    "Au",
    "Hg",
    "Tl",
    "Pb",
    "Bi",
    "Po",
    "At",
    "Rn",
    "Fr",
    "Ra",
    "Ac",
    "Th",
    "Pa",
    "U",
    "Np",
    "Pu",
    "Am",
    "Cm",
    "Bk",
    "Cf",
    "Es",
    "Fm",
    "Md",
    "No",
    "Lr",
    "Rf",
    "Db",
    "Sg",
    "Bh",
    "Hs",
    "Mt",
    "Ds",
    "Rg",
    "Cn",
    "Nh",
    "Fl",
    "Mc",
    "Lv",
    "Ts",
    "Og"
]

WL_MIN = 380
WL_MAX = 700
DELAY = 0.4


def fetch_element(symbol: str) -> list[dict]:
    response = Nist.query_async(WL_MIN * u.nm, WL_MAX * u.nm, linename=f"{symbol} I")
    df = cast(Table, Nist._parse_result(response)).to_pandas()  # type: ignore[attr-defined]

    lines = []
    for _, row in df.iterrows():
        try:
            wl_str = str(row["Observed"]).strip()
            if not wl_str or wl_str == "--":
                continue
            wl = float(wl_str)
            if not (WL_MIN <= wl <= WL_MAX):
                continue

            rel = row["Rel."]
            # ✅ cobre NaN vindo do pandas E strings como "--" ou ""
            if rel is None or (isinstance(rel, float) and math.isnan(rel)):
                intensity = 50.0
            else:
                rel_str = str(rel).strip().replace("?", "").replace("*", "")
                intensity = float(rel_str) if rel_str and rel_str != "--" else 50.0

            lines.append({"w": round(wl, 3), "i": intensity})
        except Exception:
            continue

    if lines:
        max_i = max(ln["i"] for ln in lines)
        if max_i > 0:
            for ln in lines:
                ln["i"] = round(ln["i"] / max_i * 100)

    return sorted(lines, key=lambda x: x["w"])


def nist_spectra() -> None:
    parser = argparse.ArgumentParser(description="Busca espectros do NIST ASD")
    parser.add_argument("--elements", nargs="+", default=ALL_ELEMENTS)
    parser.add_argument("--out", default="spectral_lines.json")
    args = parser.parse_args()

    result: dict[str, list] = {}
    total = len(args.elements)

    for idx, sym in enumerate(args.elements, 1):
        print(f"[{idx:3d}/{total}] {sym:<3s} ... ", end="", flush=True)
        try:
            lines = fetch_element(sym)
            result[sym] = lines
            print(f"✓  {len(lines)} linhas")
        except Exception as e:
            result[sym] = []
            print(f"✗  {e}")
        if idx < total:
            time.sleep(DELAY)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    total_lines = sum(len(v) for v in result.values())
    found = sum(1 for v in result.values() if v)
    print(f"\n{'─'*50}")
    print(f"Salvo em:               {args.out}")
    print(f"Elementos com linhas:   {found}/{total}")
    print(f"Total de linhas:        {total_lines}")


if __name__ == "__main__":  # ✅ corrigido
    nist_spectra()
