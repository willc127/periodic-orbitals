from fastapi import APIRouter, HTTPException, Query

from services.elements import find_element_by_symbol, get_elements

router = APIRouter()


@router.get("/elements-data")
async def listar_elementos(
    force_refresh: bool = Query(default=False),
) -> list[dict[str, object]]:
    return get_elements(force_refresh)


@router.get(
    "/elements-data/{symbol}", summary="Retorna dados de um elemento pelo símbolo"
)
def obter_elemento(symbol: str) -> dict[str, object]:
    element = find_element_by_symbol(symbol)
    if element is None:
        normalized_symbol = symbol.strip().capitalize()
        raise HTTPException(
            status_code=404,
            detail=f"Elemento '{normalized_symbol}' não encontrado",
        )
    return element
