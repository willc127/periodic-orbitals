# 🌍 Periodic Orbitals — Renderização Interativa de Orbitais Atômicos

[![Angular](https://img.shields.io/badge/Angular-17+-red?logo=angular)](https://angular.io)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Aplicação web fullstack para **visualização interativa de orbitais atômicos do hidrogênio**. O backend renderiza orbitais em tempo real, e o frontend exibe com interface moderna e responsiva.

> 🎯 **Objetivo:** Educação e visualização científica de conceitos de mecânica quântica.

---

## 🎬 Demonstração

**Funcionalidades principais:**

- ✨ Visualização de orbitais 2D (cortes) e 3D
- 🎨 Múltiplos colormaps (plasma, viridis, etc.)
- 🔧 Seleção interativa de números quânticos (n, l, m)
- ⚡ Renderização em tempo real via API REST
- 📱 Interface responsiva (desktop, tablet, mobile)
- 🔒 Validação de parâmetros físicos

---

## 📚 Documentação

### 🔧 Backend

**Tecnologia:** Python 3.10+, FastAPI, NumPy, SciPy, Matplotlib

Renderização científica de orbitais com API REST.

**Links importantes:**

- [Backend README](Backend/README.md) — Instruções completas, exemplos de uso, troubleshooting
- [Backend Instructions](.github/instructions/BACKEND.instructions.md) — Convenções, arquitetura, padrões
- **Comandos rápidos:**

    ```bash
    # Ativar ambiente
    .\.venv\Scripts\Activate.ps1  # Windows
    source .venv/bin/activate     # Linux/macOS

    # Instalar dependências
    pip install -r Backend/requirements.txt

    # Gerar orbitais
    python Backend/scripts/generate_orbitals.py lote

    # Iniciar servidor API
    python Backend/main.py
    ```

### 🎨 Frontend

**Tecnologia:** Angular 17+, TypeScript 5.2+, Standalone Components, SCSS

Interface moderna para visualização de orbitais.

**Links importantes:**

- [Frontend README](Frontend/periodic-orbitals-angular/README.md) — Estrutura, componentes, guia de desenvolvimento
- [Frontend Instructions](.github/instructions/FRONTEND.instructions.md) — Convenções TypeScript, boas práticas
- **Comandos rápidos:**

    ```bash
    # Instalar dependências
    cd Frontend/periodic-orbitals-angular
    npm install

    # Iniciar servidor de desenvolvimento
    ng serve

    # Build para produção
    ng build --configuration production
    ```

---

## 🚀 Quick Start

### 1️⃣ Clonar Repositório

```bash
git clone https://github.com/seu-usuario/Periodic-orbitals.git
cd Periodic-orbitals
```

### 2️⃣ Configurar Backend

```bash
# Criar e ativar ambiente virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows

# Instalar dependências
pip install -r Backend/requirements.txt

# Iniciar servidor (porta 8000)
python Backend/main.py
```

**Teste:** Acesse http://localhost:8000/docs

### 3️⃣ Configurar Frontend

```bash
cd Frontend/periodic-orbitals-angular
npm install
ng serve
```

**Teste:** Acesse http://localhost:4200

### 4️⃣ Gerar Imagens de Orbitais

```bash
# Gerar lote completo (n=1 a n=7)
python Backend/scripts/generate_orbitals.py lote

# Ou gerar orbital específico
python Backend/scripts/generate_orbitals.py individual 2 1 0 --projecao xy
```

---

## 📁 Estrutura do Projeto

```
Periodic-Orbitals/
│
├── 📄 README.md                          # Este arquivo
├── 📄 Periodic-Orbitals.fig              # Diagrama do projeto
│
├── .github/
│   ├── 📄 copilot-instructions.md        # Instruções para Copilot
│   └── instructions/
│       ├── 📄 GENERAL.instructions.md    # Boas práticas gerais
│       ├── 📄 BACKEND.instructions.md    # Convenções backend
│       └── 📄 FRONTEND.instructions.md   # Convenções frontend
│
├── Backend/                              # 🔧 API e Renderização
│   ├── 📄 README.md                      # Documentação backend
│   ├── 📄 main.py                        # Aplicação principal
│   ├── 📄 requirements.txt               # Dependências Python
│   │
│   ├── api/                              # Endpoints REST
│   ├── core/                             # Lógica científica
│   ├── services/                         # Serviços
│   ├── db/                               # Banco de dados
│   ├── config/                           # Configurações
│   ├── schemas/                          # Modelos Pydantic
│   ├── scripts/                          # Scripts utilitários
│   ├── utils/                            # Funções auxiliares
│   ├── tests/                            # Testes
│   │
│   └── images/
│       ├── cross-section-and-3d/         # Imagens geradas
│       └── grouped/                      # Imagens combinadas
│
└── Frontend/                             # 🎨 Interface Angular
    └── periodic-orbitals-angular/
        ├── 📄 README.md                  # Documentação frontend
        ├── 📄 package.json               # Dependências Node
        ├── 📄 angular.json               # Config Angular
        │
        ├── src/
        │   ├── app/
        │   │   ├── components/           # Componentes standalone
        │   │   ├── services/             # Serviços
        │   │   └── types/                # Interfaces TypeScript
        │   │
        │   ├── styles/                   # Estilos SCSS
        │   ├── environments/             # Config por ambiente
        │   └── main.ts                   # Ponto de entrada
        │
        ├── tests/                        # Testes e2e
        ├── dist/                         # Build compilado
        └── coverage/                     # Cobertura de testes
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                   │
│  - Components, Services, Type-Safe Forms, Signals      │
│  - Visualização de orbitais (2D e 3D)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP REST API
                     │ (JSON, Base64 PNG)
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Backend (FastAPI)                     │
│  - API REST, Validação, Cache de imagens              │
│  - Cálculos científicos (NumPy, SciPy)                │
│  - Renderização (Matplotlib)                          │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌──────────────┐   ┌──────────────┐
    │  Banco Dados │   │  Imagens     │
    │  (SQLite)    │   │  (Geradas)   │
    └──────────────┘   └──────────────┘
```

---

## 🔌 API REST

**Base URL (Desenvolvimento):** `http://localhost:8000`

### Endpoints Principais

| Método | Endpoint                         | Descrição                       |
| ------ | -------------------------------- | ------------------------------- |
| `GET`  | `/health`                        | Health check                    |
| `POST` | `/api/v1/orbitals/render`        | Renderizar orbital (Base64)     |
| `POST` | `/api/v1/orbitals/render-stream` | Renderizar orbital (PNG stream) |
| `GET`  | `/docs`                          | Documentação Swagger            |
| `GET`  | `/redoc`                         | Documentação ReDoc              |

### Exemplo: Renderizar Orbital 2p

```bash
curl -X POST http://localhost:8000/api/v1/orbitals/render \
  -H "Content-Type: application/json" \
  -d '{
    "n": 2,
    "l": 1,
    "m": 0,
    "plane": "xy"
  }'
```

**Resposta:**

```json
{
	"image_base64": "iVBORw0KGgoAAAANSUhEUgAAA...",
	"format": "png",
	"size": {"width": 800, "height": 600},
	"orbital": {"n": 2, "l": 1, "m": 0}
}
```

---

## 🔧 Tecnologias Utilizadas

### Backend

- **FastAPI 0.104** — Framework HTTP assíncrono
- **Python 3.10+** — Linguagem
- **NumPy** — Cálculos numéricos vetorizados
- **SciPy** — Funções especiais (harmônicos esféricos)
- **Matplotlib** — Renderização de gráficos
- **SQLAlchemy 2.0** — ORM para banco de dados
- **Pydantic 2.0** — Validação de dados

### Frontend

- **Angular 17+** — Framework web
- **TypeScript 5.2+** — Linguagem tipada
- **Standalone Components** — Arquitetura moderna
- **Signals API** — Reatividade
- **SCSS** — Preprocessador CSS
- **Reactive Forms** — Formulários validados

### DevOps & CI/CD

- **Git** — Versionamento
- **pytest** — Testes backend
- **Karma + Jasmine** — Testes frontend
- **Black, Flake8, mypy** — Qualidade de código (Python)
- **ESLint, Prettier** — Qualidade de código (TypeScript)

---


## 📚 Documentação Completa

- **[Backend/README.md](Backend/README.md)** — Como gerar imagens, estrutura, API, testes
- **[Frontend/README.md](Frontend/periodic-orbitals-angular/README.md)** — Como desenvolver, componentes, deploy
- **[General Instructions](.github/instructions/GENERAL.instructions.md)** — Segurança, testes, CI/CD, deploy
- **[Backend Instructions](.github/instructions/BACKEND.instructions.md)** — Convenções Python/FastAPI
- **[Frontend Instructions](.github/instructions/FRONTEND.instructions.md)** — Convenções Angular/TypeScript

---

## 🤝 Contribuindo

1. **Fork** o repositório
2. Crie uma **branch** para sua feature: `git checkout -b feature/minha-feature`
3. Faça **commits** descritivos: `git commit -m "feat: descrição"`
4. **Push** para a branch: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

### Boas Práticas

- ✅ Escrever testes para novas funcionalidades
- ✅ Manter cobertura de testes > 80%
- ✅ Seguir as convenções do projeto ([Backend](.github/instructions/BACKEND.instructions.md), [Frontend](.github/instructions/FRONTEND.instructions.md))
- ✅ Documentar mudanças significativas
- ✅ Incluir screenshots para mudanças visuais