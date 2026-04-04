"""Testes de integração para endpoints de orbitais."""

import pytest
from httpx import AsyncClient

from main import app


@pytest.mark.asyncio
async def test_health_check():
    """Testa endpoint de health check."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Testa endpoint raiz."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "documentation" in data


@pytest.mark.asyncio
async def test_validate_orbital_endpoint():
    """Testa endpoint de validação de orbital."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/orbitals/validate?n=2&l=1&m=0")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "valid"


@pytest.mark.asyncio
async def test_supported_orbitals_endpoint():
    """Testa endpoint de orbitais suportados."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/orbitals/supported-orbitals")
        assert response.status_code == 200
        data = response.json()
        assert "orbitals" in data
        assert data["total"] > 0
