# Backend - Gerador de Orbitais Atômicos

## 📋 Visão Geral

Este é o backend da aplicação de renderização e visualização de orbitais atômicos. Ele utiliza **FastAPI** para servir uma API REST e **Python científico** (NumPy, Matplotlib, SciPy) para gerar imagens dos orbitais do átomo de hidrogênio.

---

## 🚀 Configuração Inicial

### 1. Ativar o Ambiente Virtual

**No Windows (PowerShell):**

```powershell
.\.venv\Scripts\Activate.ps1
```

**No Linux/macOS:**

```bash
source .venv/bin/activate
```

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

---

## 📚 Como Gerar Imagens de Orbitais

### **Opção 1: Pelo Terminal (Recomendado)**

#### **Gerar lote completo (n=1 até n=7):**

```bash
python Backend/scripts/generate_orbitals.py lote
```

#### **Gerar lote customizado (n=2 até n=5 com colormap viridis):**

```bash
python Backend/scripts/generate_orbitals.py lote --n-minimo 2 --n-maximo 5 --mapa-cores viridis
```

#### **Gerar um orbital específico (2p, projeção xy):**

```bash
python Backend/scripts/generate_orbitals.py individual 2 1 0 --projecao xy
```

#### **Gerar todas as projeções de um orbital (3d com colormap plasma):**

```bash
# xy
python Backend/scripts/generate_orbitals.py individual 3 2 -1 --projecao xy

# xz
python Backend/scripts/generate_orbitals.py individual 3 2 -1 --projecao xz

# yz
python Backend/scripts/generate_orbitals.py individual 3 2 -1 --projecao yz

# 3d
python Backend/scripts/generate_orbitals.py individual 3 2 -1 --projecao 3d
```

**Parâmetros disponíveis:**

- `lote` ou `individual` - Modo de geração
- `--n-minimo` - Nível quântico mínimo (padrão: 1)
- `--n-maximo` - Nível quântico máximo (padrão: 7)
- `--projecao` - Tipo de projeção: `xy`, `xz`, `yz` ou `3d` (padrão: 3d)
- `--mapa-cores` - Colormap: `plasma`, `magma`, `viridis`, `cividis`, etc. (padrão: plasma)

**Colormaps disponíveis:** plasma, magma, viridis, cividis, twilight, rainbow, cool, hot, RdYlBu, etc.

---

### **Opção 2: Pelo VS Code**

#### **Método 1: Terminal Integrado do VS Code**

1. Abra o **Terminal Integrado**:
    - `Ctrl + ~` (Windows/Linux/macOS)
    - Ou `View → Terminal`

2. Confirme que está no diretório correto:

    ```bash
    # Deve estar em: Periodic-orbitals
    pwd  # macOS/Linux
    cd  # Windows
    ```

3. Ative o ambiente virtual:

    ```powershell
    .\.venv\Scripts\Activate.ps1  # Windows
    source .venv/bin/activate      # Linux/macOS
    ```

4. Execute os comandos de geração como descrito acima

#### **Método 2: Executar Arquivo Diretamente (Run Button)**

1. Abra o arquivo `Backend/scripts/generate_orbitals.py`

2. Clique no ícone **"Run"** (▶️) que aparece no canto superior direito

3. Isso executará com os argumentos padrão (lote n=1 até n=7, colormap plasma)

4. **Para customizar:** edite o arquivo e adicione argumentos na execução

#### **Método 3: Debug com VS Code**

1. Abra `Backend/scripts/generate_orbitals.py`

2. Pressione `F5` ou `Run → Start Debugging`

3. VS Code executará com breakpoints habilitados

4. Coloque breakpoints clicando na margem esquerda das linhas

---

## 🔍 Exemplos Práticos

### **Exemplo 1: Gerar Orbital 1s (Padrão)**

```bash
python Backend/scripts/generate_orbitals.py individual 1 0 0 --projecao 3d
```

### **Exemplo 2: Gerar Orbital 2p com Colormap Viridis**

```bash
python Backend/scripts/generate_orbitals.py individual 2 1 0 --projecao xy --mapa-cores viridis
```

### **Exemplo 3: Gerar Todos os Orbitais de n=1 a n=5**

```bash
python Backend/scripts/generate_orbitals.py lote --n-minimo 1 --n-maximo 5 --mapa-cores plasma
```

### **Exemplo 4: Gerar Orbitais Complexos (n=6,7) com Mais Amostras**

```bash
python Backend/scripts/generate_orbitals.py lote --n-minimo 6 --n-maximo 7
```

---

## 📁 Estrutura de Saída

As imagens geradas são organizadas em:

```
Backend/images/
├── cross-section-and-3d/          # Imagens originais
│   ├── 1-0-0/
│   │   ├── 1-0-0-cross-section-xy.png
│   │   ├── 1-0-0-cross-section-xz.png
│   │   ├── 1-0-0-cross-section-yz.png
│   │   └── 1-0-0-cross-section-3d.png
│   ├── 2-1-0/
│   └── ...
│
└── grouped/                       # Imagens agrupadas por orbital
    ├── 2p/
    ├── 3d/
    └── ...
```

---

## 🎨 Gerar Imagens Agrupadas

As imagens agrupadas combinam as **4 projeções** (3D, XZ, YZ, XY) em uma única imagem 2x2.

### **Como Funciona**

1. **Automático**: Cada orbital é agrupado automaticamente após gerar as 4 projeções
2. **Manual**: Você pode reagrupar orbitais já gerados

### **Método 1: Agrupamento Automático (Durante a Geração)**

Ao executar qualquer comando de geração, as imagens agrupadas são criadas automaticamente:

```bash
python Backend/scripts/generate_orbitals.py lote
```

Resultado: `Backend/images/grouped/{n}-{l}-{m}-combined.png`

### **Método 2: Reagrupar Orbitais Existentes (Python)**

Se já tem as 4 imagens geradas, pode criar um script para reagrupar:

```python
from utils.grouping_figures import batch_create_grouped_figures
import sys
from pathlib import Path

# Adicionar Backend ao path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Reagrupar todas as imagens
images_folder = "Backend/images/cross-section-and-3d"
batch_create_grouped_figures(images_folder)
```

### **Método 3: Agrupar Apenas Um Orbital**

```python
from utils.grouping_figures import create_grouped_figure
import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Agrupar orbital específico (2p, m=0)
images_folder = "Backend/images/cross-section-and-3d"
create_grouped_figure(images_folder, "2-1-0", "Backend/images/grouped/2-1-0-combined.png")
```

### **Estrutura da Imagem Agrupada**

```
┌──────────────────┬──────────────────┐
│                  │                  │
│  3D (Real)       │  XZ Projection   │
│                  │                  │
├──────────────────┼──────────────────┤
│                  │                  │
│  YZ Projection   │  XY Projection   │
│                  │                  │
└──────────────────┴──────────────────┘
```

### **Arquivos Gerados**

```
Backend/images/grouped/
├── 1-0-0-combined.png       # Orbital 1s
├── 2-1--1-combined.png      # Orbital 2p (m=-1)
├── 2-1-0-combined.png       # Orbital 2p (m=0)
├── 2-1-1-combined.png       # Orbital 2p (m=1)
├── 3-2--2-combined.png      # Orbital 3d (m=-2)
└── ...
```

---

Para executar o servidor e servir as imagens via API:

```bash
python Backend/main.py
```

Acesse:

- **API REST**: http://localhost:8000
- **Documentação Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🏗️ Estrutura do Projeto

O backend está organizado por funcionalidade:

```
Backend/
├── api/                          # Endpoints e rotas
│   ├── endpoints/
│   │   ├── health.py            # Health check
│   │   ├── images.py            # Operações com imagens
│   │   └── orbitals.py          # Renderização de orbitais
│   └── deps.py                  # Dependências compartilhadas
│
├── core/                        # Lógica científica
│   ├── hydrogen.py              # Funções de onda do hidrogênio
│   ├── render_orbital.py        # Renderização 2D/3D
│   ├── render_3d.py             # Renderização 3D avançada
│   └── get_render_radius.py     # Cálculo de raio de renderização
│
├── services/                    # Orquestração de negócio
│   ├── orbital_service.py       # Renderização e cache
│   └── image_service.py         # Gerenciamento de imagens
│
├── db/                          # Banco de dados
│   ├── models/                  # Modelos SQLAlchemy
│   ├── base.py                  # Configuração base
│   └── session.py               # Gerenciamento de sessão
│
├── config/                      # Configurações
│   ├── settings.py              # Variáveis de ambiente
│   └── constants.py             # Constantes globais
│
├── schemas/                     # Modelos Pydantic
│   ├── orbital.py               # Requisição de orbital
│   └── response.py              # Estrutura de resposta
│
├── scripts/                     # Scripts utilitários
│   ├── generate_orbitals.py    # Geração em lote
│   ├── generator.py             # Lógica de geração
│   └── runner.py                # Executor de tarefas
│
├── utils/                       # Funções auxiliares
│   ├── grouping_figures.py     # Agrupamento de imagens
│   ├── helpers.py               # Funções utilitárias
│   └── save_figure.py           # Salvamento de figuras
│
├── tests/                       # Testes unitários e integração
│   ├── unit/                    # Testes unitários
│   ├── integration/             # Testes de integração
│   └── fixtures/                # Fixtures de teste
│
├── main.py                      # Entrada da aplicação
└── requirements.txt             # Dependências
```

**Responsabilidades de cada diretório:**

- **`core/`**: Cálculos matemáticos e renderização científica
- **`api/`**: Rotas e validação de entrada
- **`services/`**: Lógica de negócio e cache
- **`db/`**: Persistência de dados
- **`scripts/`**: Ferramentas de linha de comando

---

## 🔌 API REST

### Endpoints Principais

#### 1. **Health Check**

```http
GET /health
```

**Resposta (200):**

```json
{
	"status": "ok",
	"message": "API is running"
}
```

#### 2. **Renderizar Orbital (Base64)**

```http
POST /api/v1/orbitals/render
Content-Type: application/json
```

**Requisição:**

```json
{
	"n": 2,
	"l": 1,
	"m": 0,
	"plane": "xy",
	"samples": 400,
	"cmap": "plasma"
}
```

**Resposta (200):**

```json
{
	"image_base64": "iVBORw0KGgoAAAANSUhEUgAAA...",
	"format": "png",
	"size": {"width": 800, "height": 600},
	"orbital": {"n": 2, "l": 1, "m": 0}
}
```

#### 3. **Renderizar Orbital (Stream PNG)**

```http
POST /api/v1/orbitals/render-stream
Content-Type: application/json
```

**Parâmetros:** Idênticos a `/render`

**Resposta (200):** Arquivo PNG em stream

### Parâmetros Comuns

| Parâmetro | Tipo   | Obrigatório | Padrão     | Descrição                              |
| --------- | ------ | ----------- | ---------- | -------------------------------------- |
| `n`       | int    | ✅          | -          | Nível quântico principal (1-7)         |
| `l`       | int    | ✅          | -          | Número quântico angular (0 ≤ l < n)    |
| `m`       | int    | ✅          | -          | Número quântico magnético (-l ≤ m ≤ l) |
| `plane`   | string | ❌          | `"xy"`     | Projeção: `xy`, `xz`, `yz`, ou `3d`    |
| `samples` | int    | ❌          | 400        | Resolução da grade (pixels)            |
| `cmap`    | string | ❌          | `"plasma"` | Colormap: `plasma`, `viridis`, etc.    |

### Exemplos com cURL

**Gerar orbital 2p (m=0) em XY:**

```bash
curl -X POST http://localhost:8000/api/v1/orbitals/render \
  -H "Content-Type: application/json" \
  -d '{
    "n": 2,
    "l": 1,
    "m": 0,
    "plane": "xy"
  }' > orbital.json
```

**Obter stream PNG direto:**

```bash
curl -X POST http://localhost:8000/api/v1/orbitals/render-stream \
  -H "Content-Type: application/json" \
  -d '{"n": 3, "l": 2, "m": 0}' > orbital.png
```

---

## 📊 Stack e Dependências

| Biblioteca         | Versão  | Finalidade                               |
| ------------------ | ------- | ---------------------------------------- |
| `fastapi`          | 0.104.1 | Framework HTTP para APIs REST            |
| `uvicorn`          | 0.24.0  | Servidor ASGI assíncrono                 |
| `sqlalchemy`       | 2.0.23  | ORM para gerenciamento de banco de dados |
| `pydantic`         | 2.0.0   | Validação de dados com type hints        |
| `python-multipart` | 0.0.6   | Suporte para upload de arquivos          |
| `pillow`           | 10.1.0  | Processamento e manipulação de imagens   |
| `numpy`            | -       | Cálculo numérico vetorizado              |
| `scipy`            | 1.10.0  | Funções de onda (harmônicos esféricos)   |
| `matplotlib`       | -       | Renderização e visualização              |
| `colorama`         | -       | Colorização de output em terminal        |
| `pytest`           | 7.4.0   | Framework de testes                      |
| `black`            | 23.9.0  | Formatação de código                     |
| `mypy`             | 1.5.0   | Type checking estático                   |
| `flake8`           | 6.1.0   | Linting de código                        |

---

## 🧪 Testes e Validação

### Rodar Testes Unitários

```bash
pytest Backend/tests/unit -v
```

### Rodar Todos os Testes

```bash
pytest Backend/tests -v
```

### Rodar com Cobertura

```bash
pytest Backend/tests --cov=Backend --cov-report=html
```

Resultado: Abrir `htmlcov/index.html` no navegador

### Cobertura Esperada

- **Mínimo**: 80% para merge
- **Alvo**: 90%+ para funções críticas
- **Cobertura por módulo:**
    - `core/`: 95%+ (lógica científica)
    - `services/`: 85%+
    - `api/`: 80%+

### Exemplo: Teste de Renderização

```python
# Backend/tests/unit/test_render_orbital.py
import pytest
from core.render_orbital import render_orbital


def test_render_orbital_1s():
    """Testar renderização do orbital 1s."""
    result = render_orbital(n=1, l=0, m=0, plane="xy")
    assert result is not None
    assert result.shape == (800, 800)


def test_render_orbital_2p():
    """Testar renderização do orbital 2p."""
    result = render_orbital(n=2, l=1, m=0, plane="xy")
    assert result is not None


def test_invalid_quantum_numbers():
    """Testar validação de números quânticos."""
    with pytest.raises(ValueError):
        render_orbital(n=2, l=3, m=0)  # l deve ser < n
```

---

## 📖 Documentação Adicional

- **[Instruções Backend Completas](.github/instructions/BACKEND.instructions.md)** - Convenções, padrões e boas práticas
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)** - Framework HTTP
- **[SciPy Documentation](https://scipy.org/)** - Funções de onda e harmônicos esféricos
- **[Matplotlib Documentation](https://matplotlib.org/)** - Renderização de gráficos
- **[SQLAlchemy ORM](https://www.sqlalchemy.org/)** - Gerenciamento de banco de dados
- **[Pydantic Validation](https://docs.pydantic.dev/)** - Validação de schemas

---

## ⚙️ Configurações Avançadas

### **Parâmetros de Orbitais Problemáticos**

Alguns orbitais têm configurações especiais em `Backend/scripts/generator.py`:

```python
PROBLEMATIC_ORBITALS_XY_OFFSETS = {
    (5, 3, -2): 0.85,
    (5, 3, 2): 0.75,
    # ...
}
```

Esses offsets melhoram a visualização de orbitais com baixa dinâmica em z=0.

### **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do Backend:

```env
DATABASE_URL=sqlite:///./orbitals.db
COLORMAP_DEFAULT=plasma
SAMPLES_DEFAULT=400
```

---

## 📊 Monitoramento e Logs

Ao executar, você verá:

- ✅ Progresso com barra de carregamento
- ✅ Status de cada orbital gerado
- ✅ Alertas para orbitais problemáticos (em amarelo)
- ✅ Mensagem final de sucesso

Exemplo de saída:

```
------------------------------
Preparando para renderizar 196 imagens...
------------------------------

100%|████████████████| 196/196 [12:34<00:00, 2.43 imagens/seg]
⚠️ Ajustando offset para 0.45 (m≠0, l=1, n=2) para o orbital (2,1,1)
✓ Sucesso: (2,1,1) xy com offset 0.45

------------------------------
Processo concluído!
------------------------------
```

---

## 🐛 Troubleshooting

### **Erro: "ModuleNotFoundError"**

- Certifique-se de ter instalado as dependências: `pip install -r requirements.txt`

### **Erro: "Path not found"**

- Execute os comandos a partir do diretório raiz do projeto (`Periodic-orbitals`)

### **Imagens com baixa qualidade**

- Aumente o parâmetro `samples`: use offsets automáticos em `generator.py`

### **Execução lenta**

- Reduza `--n-maximo` para testar
- Execute apenas orbitais específicos

---

## 📝 Notas Importantes

- **Números quânticos válidos:**
    - n (principal): 1, 2, 3, 4, 5, 6, 7, ...
    - l (angular): 0 ≤ l < n
    - m (magnético): -l ≤ m ≤ l

- **Exemplo válido:** n=3, l=2, m=-1 ✅
- **Exemplo inválido:** n=2, l=3 ❌ (l deve ser < n)

- **Tempo médio de geração:**
    - n=1: ~2 seg
    - n=1-3: ~30 seg
    - n=1-7: ~15 min

---

## 🔗 Recursos

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [NumPy Documentation](https://numpy.org/)
- [Matplotlib Documentation](https://matplotlib.org/)
- [SciPy Documentation](https://scipy.org/)
