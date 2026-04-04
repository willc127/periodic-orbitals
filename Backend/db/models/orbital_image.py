"""Modelo ORM para armazenar imagens de orbitais."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, LargeBinary, String

from ..base import Base


class OrbitalImage(Base):
    """Tabela para armazenar imagens renderizadas de orbitais."""

    __tablename__ = "orbital_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    orbital_name = Column(String, index=True)  # exemplo: "1-0-0", "2-1-0"
    image_data = Column(LargeBinary)  # dados binários da imagem
    content_type = Column(String)  # exemplo: "image/png"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self) -> str:
        return f"<OrbitalImage(id={self.id}, orbital_name={self.orbital_name}, filename={self.filename})>"
