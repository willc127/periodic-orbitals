# Suas importações permanecem as mesmas
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mendeleev.fetch import fetch_table
import numpy as np
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/elements-data")
async def get_elements():
    # Busca a tabela completa
    df = fetch_table("elements")

    # Seleciona as colunas desejadas
    colunas_desejadas = [
        "symbol",
        "name",
        "atomic_number",
        "atomic_weight",
        "group_id",
        "series_id",
        "period",
        "electronic_configuration",
        "description"
    ]

    df = df[colunas_desejadas]

    # Aplica match/case para classificar series
    df["series_id"] = df["series_id"].fillna(0).astype(int)
    df["type"] = df.apply(
        lambda row: classify_group(row["series_id"], row["symbol"]), axis=1
    )

    # Corrige valores para elementos 71 e 103
    df.loc[df["atomic_number"] == 57, "type"] = "Lanthanide"
    df.loc[df["atomic_number"] == 71, "type"] = "Lanthanide"
    df.loc[df["atomic_number"] == 89, "type"] = "Actinide"
    df.loc[df["atomic_number"] == 103, "type"] = "Actinide"

    # Atualiza as linhas cujo `group_id` é nulo e `type` == 'Lanthanide'. Corrige casos para elementos 57 e 89
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

    # Aplica a limpeza dos dados
    dados_limpos = clean_for_json(df)

    # Retorna a lista de dicionários com todos os 118 elementos
    return dados_limpos
