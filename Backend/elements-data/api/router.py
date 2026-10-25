from fastapi import APIRouter

from api.endpoints.cache import router as cache_router
from api.endpoints.elements import router as elements_router
from api.endpoints.favicon import router as favicon_router
from api.endpoints.isotopos import router as isotopos_router
from api.endpoints.spectra import router as spectra_router

api_router = APIRouter()
api_router.include_router(favicon_router)
api_router.include_router(elements_router)
api_router.include_router(spectra_router)
api_router.include_router(cache_router)
api_router.include_router(isotopos_router)
