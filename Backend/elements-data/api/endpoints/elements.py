from fastapi import APIRouter, HTTPException, Query, Request

from services.elements import find_element_by_symbol, get_elements

router = APIRouter()


def _with_absolute_image_url(
    element: dict[str, object], base_url: str
) -> dict[str, object]:
    result = element.copy()
    image_url = result.get("link_image")
    if isinstance(image_url, str) and image_url.startswith("/assets/"):
        result["link_image"] = f"{base_url.rstrip('/')}{image_url}"
    return result


@router.get("/elements-data")
async def listar_elementos(
    request: Request,
    force_refresh: bool = Query(default=False),
) -> list[dict[str, object]]:
    base_url = str(request.base_url)
    return [
        _with_absolute_image_url(element, base_url)
        for element in get_elements(force_refresh)
    ]


@router.get(
    "/elements-data/{symbol}", summary="Retorna dados de um elemento pelo símbolo"
)
def obter_elemento(symbol: str, request: Request) -> dict[str, object]:
    element = find_element_by_symbol(symbol)
    if element is None:
        normalized_symbol = symbol.strip().capitalize()
        raise HTTPException(
            status_code=404,
            detail=f"Elemento '{normalized_symbol}' não encontrado",
        )
    return _with_absolute_image_url(element, str(request.base_url))
