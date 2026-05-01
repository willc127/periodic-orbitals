# Instruções para Atualizar README.md

## Objetivo Geral

Manter os READMEs (Backend e Frontend) bem organizados, atualizados e informativos, refletindo corretamente a estrutura, convenções e funcionalidades do projeto Periodic Orbitals. Caso não haja arquivos README.md, crie um seguindo as diretrizes abaixo.

---

## Backend README (`Backend/README.md`)

### Estrutura Obrigatória

1. **Cabeçalho com Emoji + Visão Geral**
    - Descrição breve da responsabilidade do backend
    - Stack tecnológico (FastAPI, Python científico, etc.)
    - Link para documentação de instruções (BACKEND.instructions.md)

2. **Seção: 🚀 Configuração Inicial**
    - Ativar ambiente virtual (com scripts Windows/Linux)
    - Instalar dependências
    - Configurar variáveis de ambiente (.env)

3. **Seção: 📚 Como Usar / Como Gerar Imagens**
    - **Modo Batch**: Geração em lote completa (n=1 a n=7)
    - **Modo Individual**: Orbital específico
    - **Parâmetros disponíveis**: com tabelas ou listas
    - **Exemplos práticos**: copiar/colar prontos para os usuários
    - **Colormaps disponíveis**: listar opções

4. **Seção: 🏗️ Estrutura do Projeto**
    - Explicar diretórios principais: `/core`, `/api`, `/services`, `/db`, `/scripts`
    - Responsabilidade de cada diretório

5. **Seção: 🔌 API REST**
    - Endpoints principais (GET /health, POST /orbitals/render, etc.)
    - Descrição breve de cada endpoint
    - Exemplos de requisição/resposta (cURL ou JSON)

6. **Seção: 📊 Stack e Dependências**
    - Tabela com bibliotecas, versões e finalidades
    - Explicar por que cada biblioteca foi escolhida

7. **Seção: 🧪 Testes e Validação**
    - Como rodar testes unitários
    - Cobertura esperada (80% mínimo)
    - Exemplos de casos de teste

8. **Seção: 📖 Documentação Adicional**
    - Link para as instruções de backend
    - Link para referências matemáticas
    - Links úteis (SciPy docs, Matplotlib docs, etc.)

9. **Seção: 🐛 Troubleshooting**
    - Problemas comuns e soluções
    - Ex: "ModuleNotFoundError", "Port already in use", etc.

### Boas Práticas para Backend README

- Use **exemplos de terminal reais** (copiar/colar funciona sem erros)
- Destaque **parâmetros obrigatórios vs opcionais**
- Use **blocos de código com linguagem especificada** (bash, python, powershell)
- Mantenha **tom profissional e conciso**
- Atualize quando houver novos endpoints ou mudanças na API
- Inclua **badges** (versão Python, status build, cobertura de testes)

---

## Frontend README (`Frontend/periodic-orbitals-angular/README.md`)

### Estrutura Obrigatória

1. **Cabeçalho com Emoji + Visão Geral**
    - Descrição breve: "Interface Angular para visualização de orbitais"
    - Stack tecnológico (Angular 17+, Signals, Standalone Components, TypeScript)
    - Link para documentação de instruções (FRONTEND.instructions.md)

2. **Seção: 🚀 Configuração Inicial**
    - Verificar versão do Node.js
    - Instalar dependências: `npm install` ou `npm ci`
    - Variáveis de ambiente necessárias (.env ou environment.ts)

3. **Seção: 💻 Desenvolvimento Local**
    - Comando para iniciar dev server: `ng serve`
    - URL padrão (http://localhost:4200)
    - Como recarrega automático funciona
    - Debugging: DevTools do Chrome, Angular DevTools extension

4. **Seção: 🏗️ Estrutura do Projeto**
    - Explicar principais diretórios: `/src/app/components`, `/src/app/services`, `/src/app/models`
    - Descrever componentes principais
    - Fluxo de dados (componentes → serviços → backend)

5. **Seção: 📦 Componentes Principais**
    - Listar componentes standalone e sua responsabilidade
    - Exemplo: "OrbitalViewerComponent" - exibe orbital renderizado
    - Exemplo: "OrbitalSelectorComponent" - formulário de seleção

6. **Seção: 🔌 Comunicação com Backend**
    - Como o frontend consome a API do backend
    - URL base (localhost:8000 em dev, produção em prod)
    - Exemplo de chamada HTTP (OrbitalService)

7. **Seção: 🎨 Estilos e Tema**
    - Preprocessador: SCSS
    - Convenções de CSS (BEM ou similar)
    - Como adicionar novos componentes com estilos

8. **Seção: 🧪 Testes**
    - Como rodar testes unitários: `ng test`
    - Como rodar testes e2e
    - Cobertura esperada (75% mínimo)
    - Frameworks: Karma + Jasmine (ou similar)

9. **Seção: 📦 Build e Deploy**
    - Comando de build: `ng build`
    - Variáveis de ambiente para produção
    - Como servir a build em produção

10. **Seção: 📖 Documentação Adicional**
    - Link para instruções de frontend
    - Link para Angular CLI docs
    - Link para RxJS/Signals docs

11. **Seção: 🐛 Troubleshooting**
    - Problemas comuns: "node_modules corrompido", "porta 4200 em uso"
    - Como limpar cache: `npm cache clean --force`

### Boas Práticas para Frontend README

- Use **exemplos de código TypeScript/HTML reais**
- Destaque **convenções do projeto**: standalone components, Signals, type safety
- Use **screenshots/gifs** se for interface visual importante
- Mantenha **links para documentação** (Angular, TypeScript, SCSS)
- Inclua **badges**: versão Angular, Node.js mínima, status build
- Atualize quando adicionar novos componentes ou serviços
- Documente **environment.ts** com variáveis necessárias

---

## Instruções Gerais para Ambos

### Quando Atualizar

- ✅ Após adicionar novo endpoint (Backend)
- ✅ Após adicionar novo componente/serviço (Frontend)
- ✅ Após mudanças em dependências (package.json, requirements.txt)
- ✅ Após mudanças em variáveis de ambiente
- ✅ Após correções de bugs que afetam usuários
- ✅ Trimestralmente para revisar precisão

### Checklist de Qualidade

- [ ] Todos os exemplos funcionam (testados copy/paste)
- [ ] Links internos estão válidos
- [ ] Não há typos ou erros de formatação
- [ ] Usa emoji para melhor visualização
- [ ] Mantém tom consistente com o projeto
- [ ] Destaca melhorias significativas
- [ ] Tabelas estão bem formatadas (Markdown)
- [ ] Blocos de código têm linguagem especificada
- [ ] Screenshots/gifs (se aplicável) estão atualizados

### Tom e Estilo

- 📝 Profissional e claro
- 📌 Conciso mas informativo
- 🎯 Orientado a casos de uso reais
- 🔍 Exemplos práticos e copiar/colar
- 🌍 Em português (pt-BR)
