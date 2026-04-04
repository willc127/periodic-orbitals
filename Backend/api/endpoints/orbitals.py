"""Endpoints para renderização de orbitais."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from api.deps import get_db
from schemas.orbital import OrbitalRequest
from schemas.response import ImageResponse
from services.orbital_service import OrbitalService

router = APIRouter(prefix="/api/v1/orbitals", tags=["orbitals"])


@router.post("/render", response_model=ImageResponse)
async def render_orbital(
    request: OrbitalRequest,
    db: Session = Depends(get_db),
) -> ImageResponse:
    """
    Renderiza um orbital específico e retorna como imagem em Base64.

    Args:
        request: Parâmetros do orbital (n, l, m, plane, samples, cmap)
        db: Sessão do banco de dados

    Returns:
        ImageResponse: Imagem do orbital em Base64
    """
    service = OrbitalService(db)
    return await service.render_orbital(request)


@router.post("/render-stream", response_class=StreamingResponse)
async def render_orbital_stream(
    request: OrbitalRequest,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    Renderiza um orbital e retorna como stream PNG direto.

    Args:
        request: Parâmetros do orbital
        db: Sessão do banco de dados

    Returns:
        StreamingResponse: Stream PNG da imagem
    """
    service = OrbitalService(db)
    return await service.render_orbital_stream(request)


@router.get("/validate")
async def validate_orbital(
    n: int,
    l: int,
    m: int,
) -> dict:
    """
    Valida se os números quânticos são válidos.

    Args:
        n: Número quântico principal
        l: Número quântico angular
        m: Número quântico magnético

    Returns:
        dict: Resultado da validação
    """
    service = OrbitalService(None)
    return service.validate_orbital(n, l, m)


@router.get("/supported-orbitals")
async def get_supported_orbitals() -> dict:
    """
    Retorna lista de orbitais suportados.

    Returns:
        dict: Lista de orbitais suportados
    """
    orbitals = []
    for n in range(1, 8):
        for l in range(n):
            for m in range(-l, l + 1):
                orbitals.append({"n": n, "l": l, "m": m})

    return {"total": len(orbitals), "orbitals": orbitals}
