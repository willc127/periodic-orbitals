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
    # Converte infinitos para NaN
    df = df.replace([np.inf, -np.inf], np.nan)
    # Substitui NaN por None
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")


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
        "electronic_configuration",
    ]
    df["group_id"] = df["group_id"].fillna(0).astype(int)  # 0 para elementos sem grupo
    df = df[colunas_desejadas]

    # Aplica a limpeza dos dados
    dados_limpos = clean_for_json(df)

    # Retorna a lista de dicionários com todos os 118 elementos
    return dados_limpos
