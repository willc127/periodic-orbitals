from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Usar SQLite para simplicidade, ou trocar para PostgreSQL/MySQL
DATABASE_URL = "sqlite:///./orbitals.db"
# Para PostgreSQL: DATABASE_URL = "postgresql://user:password@localhost/orbitals"
# Para MySQL: DATABASE_URL = "mysql+pymysql://user:password@localhost/orbitals"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class OrbitalImage(Base):
    __tablename__ = "orbital_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    orbital_name = Column(String, index=True)  # exemplo: "1-0-0", "2-1-0"
    image_data = Column(LargeBinary)  # dados binários da imagem
    content_type = Column(String)  # exemplo: "image/png"
    created_at = Column(DateTime, default=datetime.utcnow)


# Criar tabelas
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
