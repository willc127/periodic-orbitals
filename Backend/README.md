# Backend — API da tabela periódica

## Visão geral

O backend é uma API REST em **FastAPI** que fornece dados para a aplicação da
tabela periódica: propriedades dos elementos, linhas espectrais e isótopos.
Ele não gera imagens de orbitais; as instruções antigas de geração e renderização
de orbitais foram removidas porque esses scripts e endpoints não fazem parte do
backend atual.

Os dados vêm de fontes distintas:

- **Elementos:** tabelas da biblioteca `mendeleev`, transformadas para incluir
  propriedades físicas e químicas, número de prótons e nêutrons, classificação
  e links úteis. O resultado é salvo em `elements-data/data/elements-data.json`.
- **Linhas espectrais:** arquivo local `spectra_lines/data/spectral_lines.json`,
  disponibilizado sob demanda por símbolo do elemento.
- **Isótopos:** dados consultados pela biblioteca `mendeleev` e convertidos para
  um formato de resposta próprio.

### Motivação para centralizar os dados no backend

O backend concentra a obtenção e a normalização dos dados científicos em um
único serviço. Assim, o frontend recebe uma estrutura consistente, sem precisar
manter cópias locais das tabelas nem implementar integrações e transformações
com as fontes de dados. A separação também permite atualizar ou enriquecer os
dados no servidor sem acoplar essas mudanças à interface.

### Por que os dados são servidos por endpoints separados?

A aplicação precisa carregar rapidamente as propriedades gerais para montar a
tabela periódica. Linhas espectrais podem conter uma lista específica por
elemento, e informações de isótopos têm estrutura, filtros e cache próprios.
Separá-las evita enviar esses dados especializados junto com cada elemento e
permite que o frontend os solicite somente quando forem necessários. Também
mantém cada consulta e sua lógica de cache independentes.

## Executar localmente

Na raiz do repositório:

```bash
python -m venv .venv
```

Ative o ambiente virtual e instale as dependências:

```bash
python -m pip install -r Backend/requirements.txt
```

Inicie a API a partir da pasta da aplicação:

```bash
cd Backend/elements-data
python -m uvicorn main:app --reload
```

- API: `http://localhost:8000`
- Swagger / OpenAPI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

O CORS permite atualmente o frontend em `http://localhost:4200`.

## Formatação Python

O Black está incluído em `Backend/requirements.txt`. Na raiz do repositório,
formate os arquivos Python do backend com:

```bash
python -m black Backend
```

Para verificar a formatação sem alterar arquivos:

```bash
python -m black --check Backend
```

## Endpoints

Base local: `http://localhost:8000`.

### Mapa de relações entre endpoints

O diagrama mostra quais rotas compartilham validações, fontes e caches. Uma
seta entre uma rota e um serviço representa uma chamada interna do backend:
as rotas não fazem requisições HTTP umas às outras.

```mermaid
flowchart TD
    Client[Frontend / cliente HTTP]

    Client --> List[GET /elements-data]
    Client --> Detail[GET /elements-data/{symbol}]
    Client --> Spectra[GET /elements-data/{symbol}/spectral_lines]
    Client --> Isotopes[GET /api/elementos/{numero_atomico}/isotopos]
    Client --> Clear[POST /cache/clear]
    Client --> Favicon[GET /favicon.ico]

    List --> ElementsService[Serviço de elementos]
    Detail --> ElementsService
    Spectra --> ElementsService
    ElementsService --> ElementsData[(elements-data.json)]
    ElementsService -. cache ausente ou force_refresh .-> ElementsSource[(Tabelas mendeleev)]
    ElementsSource --> ElementsService

    Spectra --> SpectraService[Serviço de linhas espectrais]
    SpectraService --> SpectraData[(spectral_lines.json)]

    Isotopes --> IsotopeService[Consulta e conversão de isótopos]
    IsotopeService --> IsotopeCache[(Cache em disco por elemento e filtro)]
    IsotopeCache -. cache ausente ou force_refresh .-> Mendeleev[(Banco mendeleev)]
    Mendeleev --> IsotopeService
    IsotopeService --> IsotopeCache

    Clear -. invalida cache em memória .-> ElementsService
    Clear -. invalida cache em memória .-> SpectraService
    Favicon --> Icon[(favicon.ico)]
```

Em resumo, a listagem, a consulta por símbolo e a validação da rota de linhas
espectrais reutilizam o serviço de elementos. A rota de espectros complementa
essa validação com os dados do arquivo espectral. Isótopos têm consulta e cache
independentes; a limpeza de cache não apaga esses arquivos em disco.

### `GET /elements-data`

Lista os elementos e suas propriedades gerais, incluindo símbolo, nome, número
atômico, massa, configuração eletrônica, classificação e propriedades físicas
disponíveis. Campos sem valor podem vir como `null`. As linhas espectrais não
são incluídas nessa resposta.

Query parameter:

| Parâmetro       | Tipo    | Padrão  | Descrição                                            |
| --------------- | ------- | ------- | ---------------------------------------------------- |
| `force_refresh` | boolean | `false` | Solicita a atualização dos dados antes de responder. |

Exemplo:

```http
GET /elements-data
GET /elements-data?force_refresh=true
```

### `GET /elements-data/{symbol}`

Retorna as propriedades de um único elemento, identificado pelo símbolo
químico. O símbolo é normalizado, então, por exemplo, `fe` também encontra
`Fe`.

Exemplo:

```http
GET /elements-data/Fe
```

Retorna `404` se o símbolo não corresponder a um elemento.

### `GET /elements-data/{symbol}/spectral_lines`

Retorna as linhas espectrais de um elemento sem incluí-las nas respostas
gerais da tabela. A resposta contém o símbolo normalizado e a lista
`spectral_lines`.

Exemplo:

```http
GET /elements-data/H/spectral_lines
```

Se o elemento não existir, retorna `404`. Se existir, mas não houver linhas
espectrais cadastradas, a lista é vazia.

### `GET /api/elementos/{numero_atomico}/isotopos`

Retorna os isótopos do elemento pelo número atômico. A resposta inclui a
identificação do elemento e, para cada isótopo, número de massa, símbolo,
abundância natural, estabilidade, meia-vida e modo de decaimento, quando
disponíveis.

Query parameters:

| Parâmetro           | Tipo    | Padrão  | Descrição                                                   |
| ------------------- | ------- | ------- | ----------------------------------------------------------- |
| `apenas_relevantes` | boolean | `true`  | Oculta isótopos sintéticos efêmeros sem abundância natural. |
| `force_refresh`     | boolean | `false` | Ignora o cache em disco e recalcula a resposta.             |

Exemplos:

```http
GET /api/elementos/92/isotopos
GET /api/elementos/92/isotopos?apenas_relevantes=false
GET /api/elementos/92/isotopos?force_refresh=true
```

O número atômico deve estar entre `1` e `118`; valores inválidos ou elementos
não encontrados retornam `404`. O cache em disco é separado por elemento e
filtro.

### Rotas auxiliares

Estas rotas estão implementadas, mas ocultas da documentação OpenAPI:

| Método e endpoint   | Comportamento                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `POST /cache/clear` | Limpa os caches de elementos e isótopos em disco e os caches em memória. Preserva o arquivo-fonte das linhas espectrais. |
| `GET /favicon.ico`  | Serve o favicon da aplicação.                                                                                            |

## Cache e dados

As propriedades dos elementos são geradas a partir das tabelas da biblioteca
`mendeleev` e gravadas em `elements-data/data/elements-data.json`. A resposta
de isótopos é armazenada em `elements-data/cache/isotopos/`, em arquivos
separados pelo número atômico e pelo filtro aplicado. As linhas espectrais são
lidas de `spectra_lines/data/spectral_lines.json`.

As propriedades dos elementos e as respostas de isótopos são reutilizadas por
até 30 dias; `force_refresh=true` ignora o cache do endpoint correspondente.
Consultas por símbolo usam a mesma validação da listagem. A rota
`POST /cache/clear` remove os arquivos derivados de elementos e isótopos e
invalida os caches em memória, sem apagar os dados-fonte das linhas espectrais.

### Imagens dos elementos

As imagens são servidas localmente pela API em `/assets/elements/`. Para
baixar as imagens ausentes em `elements-data/static/elements/`, execute na raiz
do repositório:

```powershell
python Backend\elements-data\download_images.py
```

O download usa as URLs originais registradas pela configuração do serviço e é
idempotente: arquivos existentes são preservados. As imagens de elementos com
número atômico a partir de 104 compartilham o placeholder `transactinoid.png`.
Thorium não é baixado porque a página identifica a fotografia como copyright
de terceiro sem indicar uma licença compatível.
As imagens são atribuídas à página do elemento em images-of-elements.com, sob
a licença [Creative Commons Attribution 3.0 Unported](http://creativecommons.org/licenses/by/3.0/);
o link de atribuição aparece junto à imagem.

## Estrutura atual

```text
Backend/
├── elements-data/
│   ├── api/               # Rotas de elementos, espectros e limpeza de cache
│   ├── data/              # Dados e metadados dos elementos
│   ├── static/elements/   # Imagens dos elementos servidas pela API
│   ├── services/          # Consulta e transformação de dados
│   ├── download_images.py # Download local das imagens licenciadas
│   ├── cache/             # Cache em disco dos isótopos
│   ├── main.py            # Criação da aplicação FastAPI
│   ├── router_isotopos.py # Rota de isótopos
│   └── schemas_isotopos.py
├── spectra_lines/
│   ├── data/              # Linhas espectrais em JSON
│   └── nist_spectra.py    # Utilitário relacionado às linhas espectrais
└── requirements.txt
```
