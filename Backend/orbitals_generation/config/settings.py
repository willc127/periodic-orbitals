"""Configurações gerais da aplicação."""

import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação de renderização de orbitais."""

    # Projeto
    PROJECT_NAME: str = "Orbital Renderer API"
    PROJECT_VERSION: str = "1.0.0"
    DESCRIPTION: str = "API para renderização e visualização de orbitais atômicos"

    # API
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "").lower() == "true"

    # Servidor
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))

    # Banco de Dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./orbitals.db")
    # Para PostgreSQL: postgresql://user:password@localhost/orbitals
    # Para MySQL: mysql+pymysql://user:password@localhost/orbitals

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:4200",  # Frontend Angular
        "http://localhost:3000",  # Desenvolvimento
    ]
    if DEBUG:
        BACKEND_CORS_ORIGINS.extend(["*"])  # Allow all in debug

    # Renderização - Padrões
    DEFAULT_SAMPLES: int = 400
    DEFAULT_CMAP: str = "magma"
    MAX_SAMPLES: int = 600
    MIN_SAMPLES: int = 100

    # Renderização - Limites
    MAX_N: int = 7  # Número quântico principal máximo
    MIN_N: int = 1  # Número quântico principal mínimo

    # Planos de renderização
    ALLOWED_PLANES: list[str] = ["xz", "xy", "yz"]
    DEFAULT_PLANE: str = "xz"

    # Colormaps permitidos
    ALLOWED_CMAPS: list[str] = [
        "magma",
        "viridis",
        "plasma",
        "inferno",
        "cividis",
        "twilight",
        "hot",
        "cool",
        "spring",
        "summer",
        "autumn",
        "winter",
    ]

    # Cache
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))  # segundos

    # Segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALLOWED_EXTENSIONS: set[str] = {"png", "jpg", "jpeg", "gif"}

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    """Retorna instância única das configurações."""
    return Settings()


settings = get_settings()
