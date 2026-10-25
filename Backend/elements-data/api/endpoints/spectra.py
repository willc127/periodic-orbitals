from fastapi import APIRouter, HTTPException

from services.elements import find_element_by_symbol
from services.spectra import get_spectral_lines

router = APIRouter()


@router.get(
    "/elements-data/{symbol}/spectral_lines", summary="Linhas espectrais de um elemento"
)
def obter_linhas_espectrais(symbol: str) -> dict[str, object]:
    element = find_element_by_symbol(symbol)
    if element is None:
        normalized_symbol = symbol.strip().capitalize()
        raise HTTPException(
            status_code=404,
            detail=f"Elemento '{normalized_symbol}' não encontrado",
        )

    normalized_symbol = str(element["symbol"])
    return {
        "symbol": normalized_symbol,
        "spectral_lines": get_spectral_lines(normalized_symbol),
    }