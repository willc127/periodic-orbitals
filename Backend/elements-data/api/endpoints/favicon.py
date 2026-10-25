from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()


@router.get("/favicon.ico", include_in_schema=False)
async def favicon() -> FileResponse:
    return FileResponse("favicon.ico")