"""Esquemas Pydantic para respostas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ResponseBase(BaseModel):
    """Estrutura base para respostas."""

    status: str = Field(..., description="Status da requisição")
    message: str = Field(..., description="Mensagem descritiva")


class ImageResponse(BaseModel):
    """Resposta contendo uma imagem codificada em base64."""

    id: Optional[int] = Field(None, description="ID da imagem no banco")
    filename: str = Field(..., description="Nome do arquivo")
    orbital_name: str = Field(..., description="Identificação do orbital (n-l-m)")
    image_base64: str = Field(..., description="Imagem em Base64")
    content_type: str = Field(..., description="Tipo MIME da imagem")
    created_at: Optional[datetime] = Field(None, description="Data de criação")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "filename": "orbital_2_1_0.png",
                "orbital_name": "2-1-0",
                "image_base64": "iVBORw0KGgoAAAANSUhEUgA...",
                "content_type": "image/png",
                "created_at": "2026-04-03T10:30:00",
            }
        }


class OrbitalListResponse(BaseModel):
    """Resposta contendo lista de orbitais."""

    total: int = Field(..., description="Total de imagens")
    images: list[ImageResponse] = Field(..., description="Lista de imagens")
