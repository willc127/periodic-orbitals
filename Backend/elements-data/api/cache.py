from fastapi import APIRouter

from router_isotopos import clear_isotopes_cache
from services.elements import clear_elements_cache
from services.spectra import clear_spectra_cache

router = APIRouter()


@router.post("/cache/clear", include_in_schema=False)
def limpar_cache() -> dict[str, str]:
    clear_elements_cache()
    clear_spectra_cache()
    clear_isotopes_cache()
    return {"message": "Caches em memória e em disco limpos"}
