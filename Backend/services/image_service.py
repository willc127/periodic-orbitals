"""Serviço de lógica de negócio para imagens."""

import base64
import io
from typing import Optional

from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from config.constants import ERROR_IMAGE_NOT_FOUND
from db.models import OrbitalImage
from schemas.response import ImageResponse, OrbitalListResponse


class ImageService:
    """Serviço para gerenciar imagens no banco de dados."""

    def __init__(self, db: Session):
        """
        Inicializa o serviço.

        Args:
            db: Sessão do banco de dados
        """
        self.db = db

    async def upload_image(
        self,
        file: UploadFile,
        orbital_name: Optional[str] = None,
    ) -> dict:
        """
        Faz upload de uma imagem para o banco de dados.

        Args:
            file: Arquivo de upload
            orbital_name: Nome do orbital (opcional)

        Returns:
            dict: Metadados da imagem salva

        Raises:
            HTTPException: Se houver erro no upload
        """
        try:
            contents = await file.read()
            content_type = file.content_type or "application/octet-stream"

            # Verificar se já existe
            existing = (
                self.db.query(OrbitalImage).filter_by(filename=file.filename).first()
            )

            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Arquivo já existe no banco",
                )

            # Salvar no banco
            db_image = OrbitalImage(
                filename=file.filename,
                orbital_name=orbital_name or "unknown",
                image_data=contents,
                content_type=content_type,
            )
            self.db.add(db_image)
            self.db.commit()
            self.db.refresh(db_image)

            return {
                "id": db_image.id,
                "filename": db_image.filename,
                "orbital_name": db_image.orbital_name,
                "size": len(contents),
                "created_at": db_image.created_at.isoformat(),
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_image(self, image_id: int) -> ImageResponse:
        """
        Recupera uma imagem pelo ID.

        Args:
            image_id: ID da imagem

        Returns:
            ImageResponse: Dados da imagem em Base64

        Raises:
            HTTPException: Se imagem não encontrada
        """
        image = self.db.query(OrbitalImage).filter_by(id=image_id).first()

        if not image:
            raise HTTPException(
                status_code=404,
                detail=ERROR_IMAGE_NOT_FOUND,
            )

        image_base64 = base64.b64encode(image.image_data).decode("utf-8")

        return ImageResponse(
            id=image.id,
            filename=image.filename,
            orbital_name=image.orbital_name,
            image_base64=image_base64,
            content_type=image.content_type,
            created_at=image.created_at,
        )

    async def download_image(self, image_id: int) -> StreamingResponse:
        """
        Faz download de uma imagem como arquivo.

        Args:
            image_id: ID da imagem

        Returns:
            StreamingResponse: Stream da imagem

        Raises:
            HTTPException: Se imagem não encontrada
        """
        image = self.db.query(OrbitalImage).filter_by(id=image_id).first()

        if not image:
            raise HTTPException(
                status_code=404,
                detail=ERROR_IMAGE_NOT_FOUND,
            )

        return StreamingResponse(
            io.BytesIO(image.image_data),
            media_type=image.content_type,
            headers={"Content-Disposition": f"attachment; filename={image.filename}"},
        )

    async def list_images(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> OrbitalListResponse:
        """
        Lista todas as imagens do banco de dados.

        Args:
            skip: Número de registros a pular
            limit: Máximo de registros a retornar

        Returns:
            OrbitalListResponse: Lista de imagens
        """
        images = self.db.query(OrbitalImage).offset(skip).limit(limit).all()

        image_responses = []
        for image in images:
            image_base64 = base64.b64encode(image.image_data).decode("utf-8")
            image_responses.append(
                ImageResponse(
                    id=image.id,
                    filename=image.filename,
                    orbital_name=image.orbital_name,
                    image_base64=image_base64,
                    content_type=image.content_type,
                    created_at=image.created_at,
                )
            )

        return OrbitalListResponse(
            total=len(image_responses),
            images=image_responses,
        )

    async def delete_image(self, image_id: int) -> dict:
        """
        Deleta uma imagem do banco de dados.

        Args:
            image_id: ID da imagem

        Returns:
            dict: Confirmação de deleção

        Raises:
            HTTPException: Se imagem não encontrada
        """
        image = self.db.query(OrbitalImage).filter_by(id=image_id).first()

        if not image:
            raise HTTPException(
                status_code=404,
                detail=ERROR_IMAGE_NOT_FOUND,
            )

        self.db.delete(image)
        self.db.commit()

        return {
            "status": "deleted",
            "message": f"Imagem {image_id} deletada com sucesso",
        }
