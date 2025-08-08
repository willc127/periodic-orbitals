# Tabela Periódica Interativa em Angular com Backend Python

## Descrição do Projeto

Aplicação web em Angular que exibe uma tabela periódica interativa. Ao clicar em um elemento químico, uma imagem do orbital atômico correspondente é exibida. As imagens são geradas dinamicamente pelo backend desenvolvido em Python.

---

## Tecnologias Utilizadas

- **Frontend:** Angular  
- **Backend:** Python (FastAPI)  
- **Comunicação:** API REST para requisição das imagens  
- **Outros:** HTTP Client Angular para integração com backend

---

## Funcionalidades

- Exibição da tabela periódica completa e responsiva  
- Clique em elementos para solicitar a imagem do orbital atômico ao backend  
- Backend processa a requisição, gera e retorna a imagem correspondente  
- Frontend exibe a imagem recebida em modal ou painel dedicado

---

## Como Rodar o Projeto

### Backend

1. Configurar ambiente Python (recomenda-se virtualenv).  
2. Instalar dependências:  
   ```bash
   pip install -r requirements.txt
3. Executar backend:
    ```bash
    uvicorn main:app --reload
### Frontend
1. Instalar dependências Angular:
    ```bash
    npm install
2. Executar aplicação:
    ```bash
    ng serve
3. Acessar no navegador: http://localhost:4200