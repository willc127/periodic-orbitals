from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from Backend.Orbitals.database import get_db, OrbitalImage
import base64
import io

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # aceita qualquer origem (para teste)
    allow_methods=["*"],
    allow_headers=["*"],
)


# Endpoint original (mantido para compatibilidade)
@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    return JSONResponse(
        {
            "filename": file.filename,
            "content_type": file.content_type,
            "image_base64": encoded,
        }
    )


# Novos endpoints para trabalhar com banco de dados
@app.post("/upload-image-db/")
async def upload_image_to_db(
    file: UploadFile = File(...),
    orbital_name: str = None,
    db: Session = Depends(get_db),
):
    """
    Salva uma imagem no banco de dados
    """
    contents = await file.read()

    # Determinar content_type
    content_type = file.content_type or "application/octet-stream"

    # Verificar se já existe
    existing = db.query(OrbitalImage).filter_by(filename=file.filename).first()
    if existing:
        raise HTTPException(status_code=400, detail="Arquivo já existe no banco")

    # Salvar no banco
    db_image = OrbitalImage(
        filename=file.filename,
        orbital_name=orbital_name or "unknown",
        image_data=contents,
        content_type=content_type,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return JSONResponse(
        {
            "id": db_image.id,
            "filename": db_image.filename,
            "orbital_name": db_image.orbital_name,
            "size": len(contents),
            "created_at": db_image.created_at.isoformat(),
        }
    )


@app.get("/image/{image_id}")
async def get_image(image_id: int, db: Session = Depends(get_db)):
    """
    Retorna uma imagem do banco de dados
    """
    image = db.query(OrbitalImage).filter_by(id=image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")

    return StreamingResponse(
        io.BytesIO(image.image_data),
        media_type=image.content_type,
        headers={"Content-Disposition": f"inline; filename={image.filename}"},
    )


@app.get("/images/list")
async def list_images(db: Session = Depends(get_db)):
    """
    Lista todas as imagens do banco de dados
    """
    images = db.query(OrbitalImage).all()
    return {
        "total": len(images),
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "orbital_name": img.orbital_name,
                "content_type": img.content_type,
                "size": len(img.image_data),
                "created_at": img.created_at.isoformat(),
            }
            for img in images
        ],
    }


@app.get("/images/orbital/{orbital_name}")
async def get_images_by_orbital(orbital_name: str, db: Session = Depends(get_db)):
    """
    Retorna todas as imagens de um orbital específico
    """
    images = db.query(OrbitalImage).filter_by(orbital_name=orbital_name).all()

    if not images:
        raise HTTPException(
            status_code=404, detail=f"Nenhuma imagem encontrada para {orbital_name}"
        )

    return {
        "orbital_name": orbital_name,
        "total": len(images),
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "content_type": img.content_type,
                "size": len(img.image_data),
            }
            for img in images
        ],
    }


@app.get("/image-base64/{image_id}")
async def get_image_base64(image_id: int, db: Session = Depends(get_db)):
    """
    Retorna uma imagem em formato Base64
    """
    image = db.query(OrbitalImage).filter_by(id=image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")

    encoded = base64.b64encode(image.image_data).decode("utf-8")
    return {
        "id": image.id,
        "filename": image.filename,
        "orbital_name": image.orbital_name,
        "content_type": image.content_type,
        "image_base64": encoded,
    }


@app.delete("/image/{image_id}")
async def delete_image(image_id: int, db: Session = Depends(get_db)):
    """
    Deleta uma imagem do banco de dados
    """
    image = db.query(OrbitalImage).filter_by(id=image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")

    db.delete(image)
    db.commit()

    return {"message": f"Imagem {image.filename} deletada com sucesso"}
