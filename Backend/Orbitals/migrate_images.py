import os
import sys
from pathlib import Path
from database import SessionLocal, OrbitalImage


def migrate_images_to_db(images_folder="Backend/images"):
    """
    Migra todas as imagens da pasta images para o banco de dados SQLite
    """
    db = SessionLocal()
    images_path = Path(images_folder)

    if not images_path.exists():
        print(f"Pasta {images_folder} não encontrada")
        return

    migrated = 0

    # Procurar por imagens em todas as subpastas
    for root, dirs, files in os.walk(images_path):
        for file in files:
            if file.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                file_path = Path(root) / file
                relative_path = file_path.relative_to(images_path)

                # Extrair nome do orbital da estrutura de pastas (ex: "2-1-0/image.png")
                orbital_name = (
                    str(relative_path.parent)
                    if relative_path.parent != Path(".")
                    else "misc"
                )

                try:
                    with open(file_path, "rb") as f:
                        image_data = f.read()

                    # Verificar se já existe
                    existing = (
                        db.query(OrbitalImage)
                        .filter_by(filename=str(relative_path))
                        .first()
                    )

                    if existing:
                        print(f"⏭️  Pulando {relative_path} (já existe no banco)")
                        continue

                    # Determinar content_type
                    ext = file_path.suffix.lower()
                    content_type_map = {
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".gif": "image/gif",
                    }
                    content_type = content_type_map.get(ext, "application/octet-stream")

                    # Criar registro no banco
                    db_image = OrbitalImage(
                        filename=str(relative_path),
                        orbital_name=orbital_name,
                        image_data=image_data,
                        content_type=content_type,
                    )
                    db.add(db_image)
                    migrated += 1
                    print(f"✓ Adicionado: {relative_path} ({len(image_data)} bytes)")

                except Exception as e:
                    print(f"✗ Erro ao processar {file_path}: {e}")

    db.commit()
    db.close()
    print(f"\n✓ Migração concluída! {migrated} imagens adicionadas ao banco de dados.")


if __name__ == "__main__":
    migrate_images_to_db()
