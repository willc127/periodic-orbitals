"""Esquemas Pydantic para orbitais."""

from typing import Optional

from pydantic import BaseModel, Field


class OrbitalParams(BaseModel):
    """Parâmetros quânticos de um orbital."""

    n: int = Field(..., ge=1, le=7, description="Número quântico principal")
    l: int = Field(..., ge=0, description="Número quântico angular")
    m: int = Field(..., description="Número quântico magnético")

    class Config:
        json_schema_extra = {
            "example": {
                "n": 2,
                "l": 1,
                "m": 0,
            }
        }


class OrbitalRequest(OrbitalParams):
    """Requisição completa para renderizar um orbital."""

    plane: str = Field(
        "xz",
        pattern="^(xz|xy|yz)$",
        description="Plano de corte para renderização 2D",
    )
    samples: int = Field(
        400,
        ge=100,
        le=600,
        description="Resolução da grade de amostragem",
    )
    cmap: str = Field(
        "magma",
        description="Colormap matplotlib",
    )
    plane_offset: float = Field(
        0.0,
        ge=0.0,
        description="Deslocamento perpendicular ao plano",
    )
    filename: Optional[str] = Field(
        None,
        description="Nome do arquivo para salvar (opcional)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "n": 2,
                "l": 1,
                "m": 0,
                "plane": "xz",
                "samples": 400,
                "cmap": "magma",
                "plane_offset": 0.0,
            }
        }
