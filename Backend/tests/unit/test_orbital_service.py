"""Testes unitários para validação de orbitais."""

import pytest
from config.constants import (
    ERROR_INVALID_L,
    ERROR_INVALID_M,
    ERROR_INVALID_N,
)
from services.orbital_service import OrbitalService


class TestOrbitalValidation:
    """Testes de validação de números quânticos."""

    def test_validate_orbital_1s(self):
        """Testa validação do orbital 1s."""
        service = OrbitalService(db=None)
        result = service.validate_orbital(n=1, l=0, m=0)
        assert result["status"] == "valid"

    def test_validate_orbital_2p(self):
        """Testa validação do orbital 2p."""
        service = OrbitalService(db=None)
        result = service.validate_orbital(n=2, l=1, m=0)
        assert result["status"] == "valid"

    def test_validate_orbital_3d(self):
        """Testa validação do orbital 3d."""
        service = OrbitalService(db=None)
        result = service.validate_orbital(n=3, l=2, m=-2)
        assert result["status"] == "valid"

    def test_invalid_n_too_small(self):
        """Testa rejeição de n < 1."""
        from fastapi import HTTPException

        service = OrbitalService(db=None)
        with pytest.raises(HTTPException) as exc_info:
            service.validate_orbital(n=0, l=0, m=0)
        assert exc_info.value.status_code == 422

    def test_invalid_n_too_large(self):
        """Testa rejeição de n > 7."""
        from fastapi import HTTPException

        service = OrbitalService(db=None)
        with pytest.raises(HTTPException) as exc_info:
            service.validate_orbital(n=8, l=0, m=0)
        assert exc_info.value.status_code == 422

    def test_invalid_l_greater_than_n(self):
        """Testa rejeição de l >= n."""
        from fastapi import HTTPException

        service = OrbitalService(db=None)
        with pytest.raises(HTTPException) as exc_info:
            service.validate_orbital(n=2, l=2, m=0)
        assert exc_info.value.status_code == 422

    def test_invalid_m_out_of_range(self):
        """Testa rejeição de m fora do intervalo [-l, l]."""
        from fastapi import HTTPException

        service = OrbitalService(db=None)
        with pytest.raises(HTTPException) as exc_info:
            service.validate_orbital(n=2, l=1, m=2)
        assert exc_info.value.status_code == 422


class TestOrbitalService:
    """Testes gerais do serviço de orbitais."""

    @pytest.mark.asyncio
    async def test_render_orbital_returns_request_data(self):
        """Testa se render_orbital retorna dados válidos."""
        from schemas.orbital import OrbitalRequest

        service = OrbitalService(db=None)
        request = OrbitalRequest(n=2, l=1, m=0)

        response = await service.render_orbital(request)

        assert response.filename is not None
        assert response.orbital_name == "2-1-0"
        assert response.content_type == "image/png"
        assert response.image_base64 is not None
