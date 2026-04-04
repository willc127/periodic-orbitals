"""Endpoints para gerenciamento de imagens."""

from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
import io
from sqlalchemy.orm import Session

from api.deps import get_db
from db.models import OrbitalImage
from schemas.response import ImageResponse, OrbitalListResponse
from services.image_service import ImageService

router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    orbital_name: Optional[str] = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Faz upload de uma imagem para o banco de dados.

    Args:
        file: Arquivo de imagem
        orbital_name: Nome do orbital (ex: "2-1-0")
        db: Sessão do banco de dados

    Returns:
        dict: Metadados da imagem salva
    """
    service = ImageService(db)
    return await service.upload_image(file, orbital_name)


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    db: Session = Depends(get_db),
) -> ImageResponse:
    """
    Recupera uma imagem pelo ID.

    Args:
        image_id: ID da imagem
        db: Sessão do banco de dados

    Returns:
        ImageResponse: Dados da imagem em Base64
    """
    service = ImageService(db)
    return await service.get_image(image_id)


@router.get("/download/{image_id}")
async def download_image(
    image_id: int,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    Faz download de uma imagem como arquivo.

    Args:
        image_id: ID da imagem
        db: Sessão do banco de dados

    Returns:
        StreamingResponse: Arquivo da imagem
    """
    service = ImageService(db)
    return await service.download_image(image_id)


@router.get("/", response_model=OrbitalListResponse)
async def list_images(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> OrbitalListResponse:
    """
    Lista todas as imagens do banco de dados.

    Args:
        skip: Número de registros a pular
        limit: Máximo de registros a retornar
        db: Sessão do banco de dados

    Returns:
        OrbitalListResponse: Lista de imagens
    """
    service = ImageService(db)
    return await service.list_images(skip, limit)


@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """
    Deleta uma imagem do banco de dados.

    Args:
        image_id: ID da imagem
        db: Sessão do banco de dados

    Returns:
        dict: Confirmação de deleção
    """
    service = ImageService(db)
    return await service.delete_image(image_id)
