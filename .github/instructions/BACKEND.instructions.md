
## Backend (Python / FastAPI)

### Stack e Bibliotecas

| Biblioteca         | Versão   | Finalidade                                              |
|--------------------|----------|--------------------------------------------------------|
| `fastapi`          | 0.104.1  | Framework HTTP para APIs REST                           |
| `uvicorn`          | 0.24.0   | Servidor ASGI                                           |
| `sqlalchemy`       | 2.0.23   | ORM para gerenciamento de banco de dados                |
| `python-multipart` | 0.0.6    | Suporte para upload de arquivos multipart               |
| `pillow`           | 10.1.0   | Processamento e manipulação de imagens                  |
| `numpy`            | -        | Cálculo numérico dos orbitais                           |
| `scipy`            | -        | Funções de onda hidrogênicas (harmônicos esféricos)     |
| `matplotlib`       | -        | Renderização 2D dos orbitais em PNG                     |
| `colorama`         | -        | Colorização de output em terminal                       |

### Convenções de Código

**Estilo e Formatação:**
- Use **snake_case** para nomes de funções, variáveis e módulos
- Use **PascalCase** para nomes de classes e tipos
- Use **UPPER_CASE** para constantes
- Máximo 120 caracteres por linha
- 4 espaços de indentação
- Siga **PEP 8** com adaptações do **Black** formatter

**Type Hints:**
- Use **type hints** obrigatoriamente em todas as funções e métodos
- Inclua o tipo de retorno sempre: `-> None`, `-> str`, `-> list[dict]`, etc.
- Use `Optional[T]` para valores que podem ser `None`
- Use `Literal[]` para valores restritos (ex: `Literal["2d", "3d"]`)
- Importe tipos do `typing` quando necessário: `Optional`, `Union`, `Callable`, etc.

**Estrutura de Módulos:**
- Organize o código em módulos por funcionalidade: `hydrogen.py`, `render_orbital.py`, `database.py`, etc.
- Use imports absolutos ao trabalhar com módulos do próprio backend
- Agrupe imports em ordem: stdlib → bibliotecas externas → módulos locais
- Evite imports circulares

**Modelos Pydantic:**
- Modelos de entrada/saída devem ser definidos com **Pydantic v2**
- Use validadores customizados quando necessário: `@field_validator`
- Documente todos os campos com `Field(description="...")`
- Exemplo:
  ```python
  from pydantic import BaseModel, Field
  
  class OrbitalRequest(BaseModel):
      n: int = Field(..., ge=1, le=7, description="Número quântico principal")
      l: int = Field(..., ge=0, description="Número quântico angular")
      m: int = Field(..., description="Número quântico magnético")
  ```

**Rotas e Endpoints:**
- Rotas seguem padrão REST: `GET /orbitals`, `POST /orbitals/render`, `DELETE /orbitals/{id}`
- Use `async def` nas rotas do FastAPI sempre que houver I/O
- Sempre inclua status codes: `@router.post("/render", status_code=200)`
- Documente rotas com docstrings e exemplos:
  ```python
  @router.post("/render", response_class=StreamingResponse)
  async def render_orbital(request: OrbitalRequest) -> StreamingResponse:
      """
      Renderiza um orbital e retorna como imagem PNG.
      
      Args:
          request: Parâmetros do orbital (n, l, m)
      
      Returns:
          StreamingResponse com PNG da imagem renderizada
      """
  ```

**Respostas HTTP:**
- Imagens são retornadas como:
  - `StreamingResponse` com `media_type="image/png"` para requests diretos
  - JSON com campo `image_base64: str` (Base64 PNG) para integração Angular
- Erros de validação de parâmetros físicos retornam HTTP 422 com mensagem clara
- Sempre use tipos corretos: `JSONResponse`, `StreamingResponse`, `FileResponse`

**Renderização de Orbitals:**
- A renderização deve ser **stateless**: cada requisição recebe parâmetros e retorna a imagem, sem persistência em disco por padrão
- Validar que `0 <= l < n` e `-l <= m <= l` antes de qualquer cálculo
- Utilizar funções de onda hidrogênicas exatas (harmônicos esféricos + polinômios de Laguerre)
- O plano padrão para renderização 2D é o plano **XZ**
- Grade de amostragem centrada na origem, escalada em unidades de raio de Bohr (a₀)

**Funções Numéricas:**
- Documente a matemática em docstrings: tipos de números quânticos, fórmulas, referências
- Use `numpy` para operações vetorizadas (evite loops)
- Use `scipy.special` para funções especiais: `sph_harm`, `assoc_laguerre`, etc.
- Sempre valide entrada e saída: `np.isfinite()`, `np.isnan()`

**Logging e Debug:**
- Use `colorama` para output colorido no terminal
- Imprima informações de progress para operações longas
- Use `print()` com prefixos `Fore.GREEN`, `Fore.YELLOW`, `Fore.RED` para diferentes tipos de mensagens
- Exemplo: `print(f"{Fore.GREEN}✓ Orbital renderizado{Style.RESET_ALL}")`

**Tratamento de Erros:**
- Use `HTTPException` do FastAPI para erros HTTP
- Retorne status codes apropriados: 400 (bad request), 404 (not found), 422 (validation), 500 (internal error)
- Sempre inclua mensagens de erro descritivas
- Exemplo:
  ```python
  if l >= n:
      raise HTTPException(status_code=422, detail=f"l deve ser menor que n: l={l}, n={n}")
  ```

**Testes:**
- Toda função de renderização deve ter testes unitários
- Cobertura mínima: orbitais 1s, 2p, 3d
- Use `pytest` para testes
- Nomeie testes como `test_<função>_<caso>`

### Parâmetros de Orbital Suportados

Os orbitais são identificados pelos números quânticos (validação obrigatória: `0 <= l < n` e `-l <= m <= l`):

| Parâmetro | Tipo | Intervalo | Descrição |
|-----------|------|-----------|-----------|
| `n` | `int` | 1 a 7 | Número quântico principal |
| `l` | `int` | 0 a n-1 | Número quântico angular (s, p, d, f...) |
| `m` | `int` | -l a l | Número quântico magnético (orientação do orbital) |
| `plane` | `str` | "xz", "xy", "yz" | Plano de corte para renderização 2D |
| `plane_offset` | `float` | 0.0 a ∞ | Deslocamento perpendicular ao plano (auto-ajustável) |
| `samples` | `int` | 100 a 600 | Resolução da grade de amostragem (padrão: 400) |
| `cmap` | `str` | "magma", "viridis", etc. | Colormap matplotlib (padrão: "magma") |
| `filename` | `str` | - | Caminho opcional para salvar a imagem |

**Exemplos de orbitais suportados:**
- `(1, 0, 0)` → orbital 1s
- `(2, 0, 0)` → orbital 2s
- `(2, 1, -1), (2, 1, 0), (2, 1, 1)` → orbitais 2p
- `(3, 2, -2) a (3, 2, 2)` → orbitais 3d
- Até `(7, 6, -6) a (7, 6, 6)` para o nível 7

**Assinatura da função Python:**

```python
def render_orbital(
    n: int,
    l: int,
    m: int,
    plane: str,
    filename: Optional[str] = None,
    samples: int = 400,
    plane_offset: float = 0.0,
    cmap: str = "magma",
) -> str:
    """
    Renderiza um orbital atômico como seção cruzada 2D.
    
    Args:
        n: Número quântico principal (1-7)
        l: Número quântico angular (0 <= l < n)
        m: Número quântico magnético (-l <= m <= l)
        plane: Plano de corte ("xz", "xy", "yz")
        filename: Caminho para salvar a imagem (opcional)
        samples: Resolução da grade (padrão 400)
        plane_offset: Deslocamento perpendicular ao plano
        cmap: Colormap matplotlib (padrão "magma")
    
    Returns:
        Caminho da imagem gerada
    """
```

**Notas importantes:**
- O plano XZ é o padrão para renderização
- Orbitais problemáticos (1, 0, 0) e alguns (2, 1, m) podem receber `plane_offset` automático quando necessário
- Resolução padrão: 400x400 pixels com DPI=600

### Exemplo de Rota

```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Optional

router = APIRouter(prefix="/orbitals", tags=["orbitals"])

@router.post("/render/{n}/{l}/{m}")
async def render_orbital_endpoint(
    n: int,
    l: int,
    m: int,
    plane: str = "xz",
    plane_offset: float = 0.0,
    samples: int = 400,
    cmap: str = "magma",
) -> FileResponse:
    """
    Renderiza um orbital atômico e retorna como imagem PNG.
    
    Parâmetros de query:
    - plane: "xz", "xy" ou "yz" (padrão: "xz")
    - plane_offset: deslocamento perpendicular (padrão: 0.0)
    - samples: resolução da grade (padrão: 400)
    - cmap: colormap matplotlib (padrão: "magma")
    
    Exemplo: /orbitals/render/3/2/1?plane=xy&samples=500
    """
    # Validar parâmetros quânticos
    if n < 1 or n > 7:
        raise HTTPException(status_code=422, detail=f"n deve estar entre 1 e 7, recebido: {n}")
    if l < 0 or l >= n:
        raise HTTPException(status_code=422, detail=f"l deve estar entre 0 e {n-1}, recebido: {l}")
    if m < -l or m > l:
        raise HTTPException(status_code=422, detail=f"m deve estar entre {-l} e {l}, recebido: {m}")
    
    try:
        from Backend.Orbitals.render_orbital import render_orbital
        filepath = render_orbital(n, l, m, plane, samples=samples, plane_offset=plane_offset, cmap=cmap)
        return FileResponse(filepath, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao renderizar orbital: {str(e)}")
```

### Regras de Renderização

**Validação:**
- Validar que `0 <= l < n` e `-l <= m <= l` antes de qualquer cálculo
- Rejeitar valores fora dos intervalos: n ∈ [1,7], l ∈ [0,n-1], m ∈ [-l,l]

**Planos de Corte:**
- Suportar três planos: **XZ** (padrão), **XY**, **YZ**
- A grade de amostragem é centrada na origem com passo uniforme: `step = 2 * render_radius_eff / samples`
- Interpretação dos planos:
  - **XZ**: linhas → z, colunas → x (horizontal = x, vertical = z), offset perpendicular = y
  - **XY**: linhas → y, colunas → x (horizontal = x, vertical = y), offset perpendicular = z
  - **YZ**: linhas → z, colunas → y (horizontal = y, vertical = z), offset perpendicular = x

**Funções de Onda:**
- Usar orbitais **reais** (convenção da química): combinações lineares dos harmônicos esféricos complexos
- Implementar `psi_real(n, l, m, r, azimuth, zenith)` com:
  - Para m = 0: usar parte real do harmônico esférico
  - Para m > 0 e m < 0: combinar Y(m) e Y(-m) com fatores de normalização √2
- Calcular densidade de probabilidade: `prob = |ψ|²`

**Raio de Renderização:**
- Usar raio efetivo variável por nível principal n:
  - n=1: `render_radius * 3.5`
  - n=2: `render_radius * 3.0`
  - n=3,4: `render_radius * 2.0`
  - n=5: `render_radius * 1.5`
  - n=6,7: `render_radius * 1.75`
- Raio base obtido de `get_render_radius(n, l)` (otimizado por nível quântico)

**Normalização e Cores:**
- Usar normalização **LogNorm** quando dinâmica > 10³, caso contrário **PowerNorm(1/3)**
- Threshold de fundo: `max(vmin * 0.5, vmax * 1e-9, 1e-22)`
- Colormap aplicado com fundo preto (`set_under("black")`)
- Cores de fundo: preto (#000000) para figura e eixos

**Renderização Final:**
- DPI: 600
- Fundo: preto
- Extent: `[-render_radius, render_radius, -render_radius, render_radius]`
- Interpolação: "nearest"
- Origem: "lower" (eixo Y crescente para cima)
- Aspect: "equal" (proporção 1:1)

**Auto-ajuste de Offset:**
- Alguns orbitais (pz com m=0, dxz/dyz com m=±1, dz² com m=0) podem ter offset automático:
  - Orbitais pz: offset = 0.7
  - Orbitais dxz/dyz: offset = 0.7
  - Orbitais dz²: offset = 0.6
  - Aplicar apenas em plane='xy' quando offset=0.0

---