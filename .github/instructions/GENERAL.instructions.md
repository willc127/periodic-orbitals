# Instruções Gerais — Segurança, Boas Práticas e DevOps

## Segurança

### Gerenciamento de Secrets

**NUNCA faça commit de:**
- Chaves de API
- Senhas ou tokens
- Variáveis de ambiente sensíveis
- Arquivos de configuração privados

**Como fazer:**
1. Criar arquivo `.env.local` (gitignored):
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost/db
   SECRET_KEY=super-secret-key
   API_KEYS=key1,key2,key3
   ```

2. Backend - usar `python-dotenv`:
   ```python
   from dotenv import load_dotenv
   import os
   
   load_dotenv()
   SECRET_KEY = os.getenv("SECRET_KEY")
   ```

3. Frontend - usar `environment.local.ts` (gitignored):
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000',
     apiKey: process.env['API_KEY'] // CI/CD injeta
   };
   ```

4. CI/CD (GitHub Actions) - usar Secrets:
   ```yaml
   - name: Deploy
     env:
      SECRET_KEY: ${{ secrets.SECRET_KEY }}
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

### Validação e Sanitização de Entrada

**Backend:**
- Usar Pydantic v2 com validadores para todas as entradas
- Validar tipos, ranges e formatos
- Rejeitar dados inesperados (forbid extra fields)
- Exemplo:
  ```python
  from pydantic import BaseModel, Field, field_validator
  
  class OrbitalRequest(BaseModel):
      n: int = Field(..., ge=1, le=7)
      l: int = Field(..., ge=0)
      m: int
      
      @field_validator('l')
      @classmethod
      def validate_l(cls, v, info):
          n = info.data.get('n')
          if n and v >= n:
              raise ValueError('l must be < n')
          return v
      
      model_config = ConfigDict(extra='forbid')
  ```

**Frontend:**
- Validar em formulários (Reactive Forms com validadores)
- Sanitizar strings antes de exibir
- Validar tipos de Blob antes de processar
- Exemplo:
  ```typescript
  if (blob.type !== 'image/png') {
    throw new Error('Invalid image type');
  }
  ```

### CORS (Cross-Origin Resource Sharing)

**Backend - Configuração segura:**
```python
from fastapi.middleware.cors import CORSMiddleware

# Produção
allowed_origins = [
    "https://orbital-renderer.com",
    "https://www.orbital-renderer.com",
]

# Desenvolvimento
if not app.state.production:
    allowed_origins.append("http://localhost:4200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restritivo
    allow_headers=["Content-Type"],  # Restritivo
    max_age=600,  # 10 minutos
)
```

### Rate Limiting

**Backend - Proteger contra abuso:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.post("/render/{n}/{l}/{m}")
@limiter.limit("10/minute")  # 10 requisições por minuto
async def render_orbital(request: Request, ...):
    pass
```

### HTTPS e Segurança em Trânsito

- **Produção**: Sempre usar HTTPS (SSL/TLS)
- **Development**: HTTP é aceitável apenas localmente
- **Certificados**: Usar Let's Encrypt ou certificado da organização
- **HSTS**: Adicionar header em produção
  ```python
  app.add_middleware(
      TrustedHostMiddleware,
      allowed_hosts=["orbital-renderer.com", "*.orbital-renderer.com"]
  )
  ```

### Logging de Segurança

**Registre:**
- Tentativas de validação falhadas
- Acessos a endpoints protegidos
- Erros de renderização
- Mudanças no estado da aplicação

**NÃO registre:**
- Senhas ou secrets
- Dados pessoais
- Números de cartão
- Tokens completos (log apenas últimos 4 caracteres)

**Backend:**
```python
import logging

logger = logging.getLogger(__name__)

@router.post("/render/{n}/{l}/{m}")
async def render_orbital(...):
    logger.info(f"Rendering orbital ({n}, {l}, {m}) from {request.client.host}")
    
    if n < 1 or n > 7:
        logger.warning(f"Invalid n={n} from {request.client.host}")
        raise HTTPException(422, "Invalid n")
```

---

## Boas Práticas de Desenvolvimento

### Git Workflow

**Branch Strategy (Git Flow simplificado):**
```
main (produção)
├── production (merge de releases)
└── develop (staging)
    ├── feature/orbital-3d-rendering
    ├── feature/user-authentication
    ├── bugfix/wrong-axis-label
    └── hotfix/critical-memory-leak
```

**Nomenclatura de branches:**
- `feature/<descrição>` — novas funcionalidades
- `bugfix/<descrição>` — correções de bugs
- `hotfix/<descrição>` — correções críticas de produção
- `docs/<descrição>` — documentação
- `chore/<descrição>` — dependências, build, etc.

**Commits:**
- Use commits atômicos: uma mudança lógica = um commit
- Mensagens descritivas em inglês ou português consistente
- Padrão: `<tipo>: <descrição concisa>`
  ```
  feat: add 3D orbital rendering
  fix: correct orbital normalization in pz orbitals
  docs: update API documentation
  refactor: extract orbital computation logic
  test: add test coverage for hydrogen.py
  ```

**PRs (Pull Requests):**
- Título descritivo: `feat: Add orbital caching for performance`
- Descrição com:
  - O que foi mudado e por quê
  - Como testar
  - Screenshot/GIF para mudanças visuais
  - Referência a issues: `Closes #42`
- Mínimo 1 revisor antes de merge
- Todos os testes passando (CI/CD)
- Sem conflicts com `develop`

### Documentação

**Código:**
- Docstrings em todas as funções públicas (Google style):
  ```python
  def render_orbital(n: int, l: int, m: int) -> str:
      """
      Renderiza um orbital atômico como imagem PNG.
      
      Calcula a função de onda hidrogênica real para os números
      quânticos fornecidos e gera uma representação visual.
      
      Args:
          n: Número quântico principal (1-7)
          l: Número quântico angular (0 <= l < n)
          m: Número quântico magnético (-l <= m <= l)
      
      Returns:
          Caminho para o arquivo PNG gerado
      
      Raises:
          ValueError: Se os números quânticos forem inválidos
      
      Example:
          >>> render_orbital(2, 1, 0)
          'Backend/images/2-1-0/2-1-0-cross-section-xz.png'
      """
  ```

- Comments para lógica complexa:
  ```python
  # Usar LogNorm quando há grande dinâmica (vmax/vmin > 1e3)
  # para melhor visualização de orbitais difusos
  use_log = (vmax / max(vposmin, 1e-300)) > 1e3
  ```

- Type hints completos (Python/TypeScript)

**Projeto:**
- Manter README.md atualizado
- Documentar decisões arquiteturais em `/docs/ADR-*.md`
- Changelog em `CHANGELOG.md` com versões e mudanças
- API docs auto-geradas: Swagger (FastAPI) + Compodoc (Angular)

### Testes

**Cobertura Mínima:**
- Backend: 80% (pytest)
- Frontend: 75% (Jasmine)

**Estrutura:**
```
Backend/
  tests/
    test_hydrogen.py
    test_render_orbital.py
    test_render_3d.py

Frontend/
  src/
    app/
      services/
        orbital.service.spec.ts
      components/
        orbital-viewer.component.spec.ts
```

**Exemplo Backend:**
```python
import pytest
from Backend.Orbitals.hydrogen import radial_function, psi_real

def test_radial_function_1s():
    """Testa função radial para orbital 1s (n=1, l=0)"""
    r = 0.5
    result = radial_function(r, n=1, l=0)
    assert result > 0
    assert np.isfinite(result)

@pytest.mark.parametrize("n,l,m", [(1,0,0), (2,1,0), (3,2,1)])
def test_psi_real_valid(n, l, m):
    """Testa orbitais válidos"""
    result = psi_real(n, l, m, r=1.0, azimuth=0, zenith=0)
    assert np.isfinite(result)
    assert not np.isnan(result)

def test_render_orbital_invalid_quantum_numbers():
    """Testa rejeição de números quânticos inválidos"""
    with pytest.raises(ValueError):
        render_orbital(n=2, l=2, m=0)  # l deve ser < n
```

**Exemplo Frontend:**
```typescript
describe('OrbitalService', () => {
  let service: OrbitalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrbitalService]
    });
    service = TestBed.inject(OrbitalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch orbital image', () => {
    const params: OrbitalParams = { n: 2, l: 1, m: 0, plane: 'xz' };
    const mockBlob = new Blob(['image']);

    service.renderOrbital(params).subscribe(result => {
      expect(result).toBe(mockBlob);
    });

    const req = httpMock.expectOne(req => req.url.includes('/orbitals/render'));
    expect(req.request.method).toBe('POST');
    req.flush(mockBlob);
  });

  it('should handle 422 validation error', () => {
    service.renderOrbital({ n: 2, l: 2, m: 0, plane: 'xz' })
      .subscribe(
        () => fail('should error'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(422);
        }
      );

    const req = httpMock.expectOne(req => req.url.includes('/orbitals/render'));
    req.flush('Invalid quantum numbers', { status: 422, statusText: 'Unprocessable Entity' });
  });
});
```

**Rodar testes:**
```bash
# Backend
pytest --cov=Backend.Orbitals --cov-report=html

# Frontend
npm run test -- --code-coverage
```

### Performance

**Backend:**
- Cache de imagens em memória (Redis em produção):
  ```python
  from functools import lru_cache
  
  @lru_cache(maxsize=128)
  def render_orbital_cached(n, l, m, plane, samples):
      return render_orbital(n, l, m, plane, samples)
  ```

- Limitar resolução máxima (samples ≤ 600)
- Timeout para renderização: 30 segundos
- Compression de respostas:
  ```python
  app.add_middleware(GZipMiddleware, minimum_size=1000)
  ```

**Frontend:**
- Lazy loading de imagens
- Compression de bundles (ng build --configuration production)
- Caching com Service Workers
- Evitar change detection desnecessária (OnPush strategy)

### Monitoramento e Logging

**Backend:**
```python
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Logs estruturados
logger.info("orbital_rendered", extra={
    "n": n, "l": l, "m": m,
    "duration_ms": elapsed,
    "image_size_kb": size
})
```

**Frontend:**
```typescript
// Google Analytics ou similar
declare let gtag: Function;

gtag('event', 'orbital_rendered', {
  n: params.n,
  l: params.l,
  m: params.m,
  render_time_ms: duration
});
```

---


### Backup e Recuperação

- Fazer backup regular do banco de dados (diário em produção)
- Versionar imagens geradas importantes
- Documentar procedimento de disaster recovery

```bash
# Backup manual
docker exec periodic_db pg_dump -U user orbitals > backup_$(date +%Y%m%d).sql

# Restaurar
cat backup_20260403.sql | docker exec -i periodic_db psql -U user orbitals
```

---

## Checklist para Release

- [ ] Todos os testes passando (backend + frontend)
- [ ] Coverage > 80% (backend), > 75% (frontend)
- [ ] Code review aprovado
- [ ] Changelog atualizado
- [ ] Documentação atualizada
- [ ] Sem warnings de build
- [ ] Docker builds sem erros
- [ ] Variáveis de ambiente documentadas
- [ ] Secrets rotacionados
- [ ] Performance testada
- [ ] Security scan (OWASP, SonarQube)
- [ ] Approved por tech lead

