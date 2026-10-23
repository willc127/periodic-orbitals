from fastapi import APIRouter

from api.cache import router as cache_router
from api.elements import router as elements_router
from api.spectra import router as spectra_router

api_router = APIRouter()
api_router.include_router(elements_router)
api_router.include_router(spectra_router)
api_router.include_router(cache_router)
