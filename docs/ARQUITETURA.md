# Arquitetura do DataPulse

## Visão geral

```mermaid
flowchart LR
    U[Usuário] --> FE["Frontend<br/>(TanStack Start + React)"]
    FE -- "HTTP/JSON<br/>VITE_API_URL" --> API["backend/<br/>FastAPI"]
    FE -. "sem VITE_API_URL" .-> MOCK["src/mocks<br/>(dados de demonstração)"]
    API --> FEAT["features/<br/>uma pasta por funcionalidade"]
    FEAT --> REPO["DatasetRepository"]
    REPO --> DISK[("hoje: disco local<br/>Parquet + meta.json")]
    REPO -. "Sprint 2" .-> SB[("Supabase<br/>Postgres + Storage")]
```

| Parte | Pasta | Papel |
| --- | --- | --- |
| Frontend | `Frontend/` | Landing page e aplicação (dashboard, datasets, importação, explorador). Projeto conectado ao Lovable. |
| API | `backend/` | Recebe arquivos, trata e guarda os dados, serve linhas paginadas e estatísticas. |
| Protótipo | `app.py` | App Streamlit original. Será aposentado quando o Frontend cobrir o mesmo fluxo (Sprint 4). |

O Frontend nunca fala direto com dados: tudo passa por `Frontend/src/services/` (cliente central
em `http.ts`). Com `VITE_API_URL` definido, chama a API; sem ele, usa os mocks.

## Hospedagem (decidido)

| Peça | Onde roda |
| --- | --- |
| Frontend e API | **Vercel** |
| Banco de metadados, arquivos e login | **Supabase** (Postgres, Storage e Auth) |

Consequências que guiam o roadmap (`docs/ROADMAP.md`):

- Na Vercel o disco é temporário: os dados não podem ficar em `backend/storage/`. O
  `DatasetRepository` ganha uma versão Supabase (metadados no Postgres, Parquet no Storage).
- A Vercel limita o tamanho do corpo de cada requisição (cerca de 4,5 MB). Arquivos maiores vão do
  navegador **direto para o Supabase Storage** e a API só processa o que já está lá.
- pandas + pyarrow são pesados para uma função da Vercel; o tamanho do pacote é verificado no
  primeiro deploy (Sprint 2), quando ainda é barato trocar de abordagem.
- O Frontend usa Nitro no build; o alvo de deploy precisa ser o da Vercel (hoje o padrão é Cloudflare).
- Migrações do banco ficam em `supabase/` na **raiz** do repositório, nunca em `Frontend/supabase/`,
  que é área gerenciada pelo Lovable.

## Backend em vertical slices

Cada **funcionalidade** é uma pasta com tudo o que ela precisa (rota, regra e contrato), em vez de
espalhar uma funcionalidade por pastas técnicas (`routes/`, `services/`, `schemas/`...).

```
backend/app/
├── main.py                    # monta o app: CORS, erros → HTTP, registra as features
├── shared/                    # o que qualquer feature pode usar
│   ├── config.py              # Settings (variáveis DATAPULSE_*)
│   ├── errors.py              # categorias de erro: NaoEncontrado (404), EntradaInvalida (422), LimiteExcedido (413)
│   └── api_model.py           # base dos contratos (JSON em camelCase)
└── features/
    ├── health/endpoint.py     # GET /api/health
    └── datasets/
        ├── models.py          # Dataset e DatasetMeta (usados por várias fatias)
        ├── errors.py          # DatasetNaoEncontrado, ArquivoInvalido, ArquivoMuitoGrande
        ├── repository.py      # onde os datasets são guardados
        ├── dependencies.py    # entrega o repositório às rotas
        ├── importar/          # POST /upload → endpoint, caso_de_uso, leitura_csv, datas
        ├── listar/            # GET  /
        ├── obter/             # GET  /{id}
        ├── remover/           # DELETE /{id}
        ├── linhas/            # GET  /{id}/rows → endpoint, paginacao
        └── estatisticas/      # GET  /{id}/stats → endpoint, perfil
```

Regras:

1. **Uma fatia não importa outra fatia.** O que duas fatias precisam vai para a raiz da feature
   (`models.py`, `repository.py`...); o que duas features precisam vai para `shared/`.
2. **Contrato mora com quem usa.** `PaginatedRows` só existe em `linhas/`; `ColumnStats` só em
   `estatisticas/`. Sobe para `models.py` quando uma segunda fatia precisar.
3. **Endpoint fino.** O `endpoint.py` traduz HTTP ↔ Python. Regras com mais de poucas linhas
   ficam num módulo ao lado (`caso_de_uso.py`, `paginacao.py`), testável sem HTTP.
4. **Erros por categoria.** Cada erro herda de uma categoria de `shared/errors.py`, que define o
   status HTTP. O `main.py` não conhece erros de nenhuma feature.
5. **Testes espelham as fatias:** `tests/features/datasets/test_importar.py` e assim por diante.

### Como criar uma nova fatia

1. Crie `app/features/<feature>/<fatia>/endpoint.py` com um `router = APIRouter()`.
2. Registre o router no `__init__.py` da feature.
3. Crie `tests/features/<feature>/test_<fatia>.py`.

O Frontend adota a mesma organização (`src/features/<feature>/`) no Sprint 1.

## Contrato da API

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/api/health` | `{status, version}` |
| GET | `/api/datasets` | `Dataset[]` (mais recentes primeiro) |
| POST | `/api/datasets/upload` | `Dataset` (201). Multipart: `file`, opcionais `description`, `separator`, `encoding` |
| GET | `/api/datasets/{id}` | `Dataset` |
| DELETE | `/api/datasets/{id}` | 204 |
| GET | `/api/datasets/{id}/rows?page=1&page_size=25` | `PaginatedRows` (página começa em 1, máx. 1000 linhas) |
| GET | `/api/datasets/{id}/stats` | `ColumnStats[]` |

Erros esperados respondem `{"detail": "mensagem"}`: 404 (dataset não existe), 413 (arquivo acima
de `DATAPULSE_MAX_UPLOAD_MB`), 422 (arquivo ilegível, vazio ou formato não suportado). A
documentação interativa fica em `http://localhost:8000/docs` (a raiz `/` redireciona para lá).

Ao mudar um contrato, altere juntos o modelo Python da fatia e `Frontend/src/types/index.ts`.

## Fluxo de importação

1. O Frontend valida uma prévia no navegador (Papa Parse, só as primeiras linhas).
2. Ao concluir, envia o arquivo para `POST /api/datasets/upload`.
3. A API copia o upload para `storage/tmp/` respeitando o limite de tamanho, detecta encoding
   (utf-8 → latin-1) e separador (`, ; tab |`), lê com pandas e converte colunas de data.
4. Os dados vão para `data.parquet` (preserva tipos e lê rápido) e os metadados para `meta.json`,
   escritos numa pasta temporária e renomeados, para nunca aparecer um dataset pela metade.
5. Leituras posteriores (linhas, estatísticas) usam um cache LRU dos últimos DataFrames.

Hoje a importação é síncrona e o dataset já nasce `processado`.

## Decisões

- **FastAPI + pandas**: reaproveita o código do protótipo e o ecossistema de dados do Python.
- **Vertical slices**: cada funcionalidade é lida, alterada e testada num lugar só.
- **Repositório como única peça que conhece o armazenamento**: trocar disco por Supabase é uma
  nova implementação com os mesmos métodos, sem mexer nas fatias.
- **Tipos semânticos no backend**: o Frontend recebe `moeda`, `data`, `categoria` etc. prontos.
- **bun no Frontend**: é o gerenciador do Lovable (`bun.lock`); `package-lock.json` é ignorado.
- **Vercel + Supabase**: ver "Hospedagem".

## Próximos passos

Ver `docs/ROADMAP.md`.
