# Copilot Instructions — Orbital Renderer

## Visão Geral do Projeto

Este projeto é uma aplicação web fullstack para **renderização e visualização de orbitais atômicos**.

- **Backend**: Python (FastAPI) — responsável por gerar e servir as imagens dos orbitais
- **Frontend**: Angular — responsável por exibir as imagens e permitir interação com o usuário

---

## Estrutura de Diretórios

```
Periodic-Orbitals/
│
├── 📄 README.md
├── 📄 Periodic-Orbitals.fig
├── 📄 .github/
│   ├── 📄 copilot-instructions.md
│   └── 📁 instructions/
│       ├── 📄 GENERAL.instructions.md
│       ├── 📄 BACKEND.instructions.md
│       └── 📄 FRONTEND.instructions.md
│
├── 📁 Backend/
│   ├── 📄 main.py
│   ├── 📄 index.html
│   ├── 📄 requirements.txt
│   ├── 📁 __pycache__/
│   │
│   ├── 📁 Orbitals/
│   │   ├── 📄 database.py
│   │   ├── 📄 generate_orbitals.py
│   │   ├── 📄 generator.py
│   │   ├── 📄 get_render_radius.py
│   │   ├── 📄 grouping_figures.py
│   │   ├── 📄 helpers.py
│   │   ├── 📄 hydrogen.py
│   │   ├── 📄 migrate_images.py
│   │   ├── 📄 render_3d.py
│   │   ├── 📄 render_orbital.py
│   │   ├── 📄 runner.py
│   │   ├── 📄 save_figure.py
│   │   ├── 📄 teste.py
│   │   └── 📁 __pycache__/
│   │
│   └── 📁 images/
│       ├── 📁 cross-section-and-3d
│       │   ├── 📁 1-0-0/
│       │   ├── 📁 2-0-0/
│       │   ├── 📁 2-1-{-1,0,1}/
│       │   ├── 📁 3-{0,1,2}-{-2...2}/
│       │   ├── 📁 4-{0,1,2,3}-{-3...3}/
│       │   ├── 📁 5-{0,1,2,3,4}-{-4...4}/
│       │   ├── 📁 6-{0,1,2,3,4,5}-{-5...5}/
│       │   ├── 📁 7-{0,1,2,3,4,5,6}-{-6...6}/
│       └── 📁 grouped/
│           └── [Imagens agrupadas por orbital]
│
└── 📁 Frontend/
    └── 📁 periodic-orbitals-angular/
        ├── 📄 angular.json
        ├── 📄 karma.conf.js
        ├── 📄 package.json
        ├── 📄 tsconfig.json
        ├── 📄 tsconfig.app.json
        ├── 📄 tsconfig.spec.json
        ├── 📄 tsconfig.doc.json
        ├── 📄 README.md
        │
        ├── 📁 public/
        ├── 📁 src/
        │   └── [Componentes, serviços, e outros arquivos Angular]
        │
        ├── 📁 documentation/
        │   └── [Documentação gerada automaticamente]
        │
        └── 📁 coverage/
            └── [Relatórios de cobertura de testes]
```

---


## Boas Práticas Gerais

Para boas práticas completas sobre segurança, DevOps, testes, Git workflow e deploy, consulte:
- [📋 GENERAL.instructions.md](./instructions/GENERAL.instructions.md) — Segurança, testes, CI/CD, deploy
- [🔧 BACKEND.instructions.md](./instructions/BACKEND.instructions.md) — Convenções Python/FastAPI
- [🎨 FRONTEND.instructions.md](./instructions/FRONTEND.instructions.md) — Convenções Angular/TypeScript

### Resumo Rápido

- **Não** incluir arquivos de imagem gerados no controle de versão (adicionar ao `.gitignore`).
- **Não** hardcodar URLs — sempre usar variáveis de ambiente.
- **Não** fazer commit de secrets (`.env`, chaves de API, tokens).
- **Não** expor parâmetros internos de renderização desnecessariamente na API pública.
- Toda função de renderização deve ter testes unitários cobrindo pelo menos os orbitais 1s, 2p, 3d.
- Documentar novos tipos de renderização no README e nos arquivos de instruções.
- PRs devem incluir print/screenshot do orbital renderizado quando houver mudança visual.
- Usar branch strategy: `main` (produção) ← `develop` (staging) ← feature branches.
- Commits com mensagens descritivas: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
- Mínimo 80% coverage no backend, 75% no frontend.
- Caso não encontre nenhuma solução para algum problema dê sugestões para que o usuário possa resolver o problema, como por exemplo: "Tente usar a função X para resolver o problema Y" ou "Considere refatorar a função Z para melhorar a legibilidade do código".
- 

---
