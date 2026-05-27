# Suas importações permanecem as mesmas
from pathlib import Path
import json
from functools import lru_cache
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from mendeleev.fetch import fetch_table
import numpy as np
import pandas as pd
import re

# * paths 
DATA_DIR = Path(__file__).parent 
ELEMENTS_FILE = DATA_DIR / "data"/ "elements-data.json"

SPECTRA_DIR = Path(__file__).parent.parent
SPECTRA_FILE = SPECTRA_DIR /"spectra_lines"/"data"/ "spectral_lines.json"

# * juntar dados do mendelev + espectros 
@lru_cache(maxsize=1)
def load_elements() -> list[dict]:
    if not ELEMENTS_FILE.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {ELEMENTS_FILE}")
    if not SPECTRA_FILE.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {SPECTRA_FILE}")

    elements: list[dict] = json.loads(ELEMENTS_FILE.read_text(encoding="utf-8"))
    spectra: dict[str, list] = json.loads(SPECTRA_FILE.read_text(encoding="utf-8"))

    for element in elements:
        symbol = element.get("symbol", "")
        element["spectral_lines"] = spectra.get(symbol, [])

    return elements


# _ Aplicação principal 
app = FastAPI(
    title="Periodic Table API",
    description="Elementos químicos com linhas espectrais",
    version="1.0.0",
)


# * Adiciona favicon 
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("favicon.ico")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#  * Limpeza dos dados 
def clean_for_json(df: pd.DataFrame) -> list:
    """
    Substitui valores infinitos e NaN por None
    para serem convertidos para 'null' no JSON.
    """
    df = df.copy()
    # Converte infinitos para NaN
    df = df.replace([np.inf, -np.inf], np.nan)
    # Substitui NaN por None em todas as colunas
    df = df.astype(object).where(pd.notnull(df), None)
    return df.to_dict(orient="records")

# _ endpoint principal
@app.get("/elements-data")
async def get_elements():
    # * Busca a tabela completa 
    df = fetch_table("elements")

    # * Seleciona as colunas desejadas 
    colunas_desejadas = [
        "symbol",
        "name",
        "atomic_number",
        "atomic_weight",
        "group_id",
        "series_id",
        "period",
        "electronic_configuration",
        "description",
    ]

    df = df[colunas_desejadas]

    # * Customização de colunas 

    df["series_id"] = df["series_id"].fillna(0).astype(int)

    # * Trunca valor de massa atômica para 2 casas decimais e adiciona o sufixo 'ua' 
    df["atomic_weight"] = df["atomic_weight"].apply(
        lambda x: f"{round(x, 2)} ua" if pd.notnull(x) else x
    )

    # * Aplica match/case para classificar series do elemento 
    def classify_group(series_id: int | None, symbol: str) -> str | None:

        match symbol:
            case "H":
                return "Hydrogen"

        match series_id:
            case 1:
                return "Nonmetal"
            case 2:
                return "Noble-Gas"
            case 3:
                return "Alkali-Metal"
            case 4:
                return "Alkaline-Earth-Metal"
            case 5:
                return "Metalloid"
            case 6:
                return "Halogen"
            case 7:
                return "Poor-Metal"
            case 8:
                return "Transition-Metal"
            case 9:
                return "Lanthanide"
            case 10:
                return "Actinide"

    df["type"] = df.apply(
        lambda row: classify_group(row["series_id"], row["symbol"]), axis=1
    )

    # * Adiciona link para vídeos do Periodic Videos 
    df["link"] = df["atomic_number"].apply(
        lambda num: f"http://www.periodicvideos.com/videos/{int(num):03d}.htm"
    )

    # * Adiciona link para dados de espectroscopias do NIST 
    df["link_nist"] = df["symbol"].apply(
        lambda atom_symbol: f"https://physics.nist.gov/cgi-bin/ASD/lines1.pl?spectra={atom_symbol}&output_type=0&low_w=&upp_w=&unit=1&submit=Retrieve+Data&de=0&plot_out=0&I_scale_type=1&format=0&line_out=0&en_unit=0&output=0&bibrefs=1&page_size=15&show_obs_wl=1&show_calc_wl=1&unc_out=1&order_out=0&max_low_enrg=&show_av=2&max_upp_enrg=&tsb_value=0&min_str=&A_out=0&intens_out=on&max_str=&allowed_out=1&forbid_out=1&min_accur=&min_intens=&conf_out=on&term_out=on&enrg_out=on&J_out=on"
    )

    # * Corrige formatação da distribuição eletrônica: números em sobrescrito e '1' implícito 
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

    def _to_superscript(match: re.Match) -> str:
        principal = match.group(1)
        orbital = match.group(2)
        number = match.group(3) or "1"
        return f"{principal}{orbital}{number.translate(superscript_map)}"

    def format_electronic_config(value):
        if pd.isna(value):
            return value
        s = re.sub(r"\s+", " ", str(value)).strip()
        # Substitui padrões como '6s2' ou '6p' por '6s²' e '6p¹'
        s = re.sub(r"(\d+)([spdfg])(\d*)", _to_superscript, s)
        return s

    df.loc[df["electronic_configuration"].notnull(), "electronic_configuration"] = (
        df.loc[
            df["electronic_configuration"].notnull(), "electronic_configuration"
        ].apply(format_electronic_config)
    )

    # * Corrige valores para elementos 71 e 103 
    df.loc[df["atomic_number"] == 57, "type"] = "Lanthanide"
    df.loc[df["atomic_number"] == 71, "type"] = "Lanthanide"
    df.loc[df["atomic_number"] == 89, "type"] = "Actinide"
    df.loc[df["atomic_number"] == 103, "type"] = "Actinide"

    # * Atualiza as linhas cujo `group_id` é nulo e `type` == 'Lanthanide'. Corrige casos para elementos 57 e 89 
    mask_lanthanide = (df["group_id"].isnull() & (df["type"] == "Lanthanide")) | (
        df["atomic_number"] == 57
    )
    mask_actinide = (df["group_id"].isnull() & (df["type"] == "Actinide")) | (
        df["atomic_number"] == 89
    )

    lanthanide_group = 4
    actinide_group = 4

    if mask_lanthanide.any():
        for idx in df.index[mask_lanthanide]:
            df.at[idx, "group_id"] = lanthanide_group
            lanthanide_group += 1
        df.loc[mask_lanthanide, "period"] = 8

    if mask_actinide.any():
        for idx in df.index[mask_actinide]:
            df.at[idx, "group_id"] = actinide_group
            actinide_group += 1
        df.loc[mask_actinide, "period"] = 9
    
    dados_limpos = clean_for_json(df)
    
    # * Salva localmente em data/elements.json 
    out = Path("data/elements-data.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(dados_limpos, indent=2, ensure_ascii=False), encoding="utf-8")
    
    # * merge de dados_limpos com linhas espectrais 
    if SPECTRA_FILE.exists():
        spectra: dict = json.loads(SPECTRA_FILE.read_text(encoding="utf-8"))
        for element in dados_limpos:
            element["spectral_lines"] = spectra.get(element["symbol"], [])

    # * salva dados localmente 
    ELEMENTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ELEMENTS_FILE.write_text(
        json.dumps(dados_limpos, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # * Retorna os dados de todos os 118 elementos 
    return dados_limpos


# _ endpoint para dados de um único elemento 
@app.get("/elements-data/{symbol}", summary="Retorna dados de um elemento pelo símbolo")
def get_element(symbol: str):
    elements = load_elements()
    symbol = symbol.strip().capitalize()      
 
    for element in elements:
        if element.get("symbol") == symbol:
            return element
 
    raise HTTPException(status_code=404, detail=f"Elemento '{symbol}' não encontrado")

# _ endpoint para as linhas espectrais de um elemento 
@app.get("/elements-data/{symbol}/spectral_lines", summary="Linhas espectrais de um elemento")
def get_spectral_lines(symbol: str):
    element = get_element(symbol)
    return {
        "symbol":         element["symbol"],
        "spectral_lines": element["spectral_lines"],
    }
