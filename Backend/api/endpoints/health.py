"""Endpoint de health check."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check da API.

    Returns:
        dict: Status da aplicação
    """
    return {"status": "ok", "message": "API is running"}
