# Arquitetura do DataPulse

## Visão geral

```mermaid
flowchart LR
    U[Usuário] --> FE["Frontend<br/>(TanStack Start + React)"]
    FE -- "HTTP/JSON<br/>VITE_API_URL" --> API["backend/<br/>FastAPI"]
    API --> FEAT["features/<br/>uma pasta por funcionalidade"]
    FEAT --> REPO["DatasetRepository"]
    REPO --> SB[("Supabase<br/>Postgres + Storage (S3)")]
    REPO -. "desenvolvimento/testes" .-> DISK[("pasta local<br/>Parquet + meta.json")]
```

| Parte | Pasta | Papel |
| --- | --- | --- |
| Frontend | `Frontend/` | Aplicação (visão geral, dashboard, datasets, importação, explorador). Projeto conectado ao Lovable. |
| API | `backend/` | Recebe arquivos, trata e guarda os dados, serve linhas paginadas e estatísticas. |

O Frontend nunca fala direto com o banco: cada feature tem uma pasta `api/` com uma interface e a
implementação HTTP (usa `src/lib/http.ts`, endereço em `VITE_API_URL`). **Não há dados de
demonstração**: o site mostra só o que existe na API. Telas ainda não construídas usam o componente
`ComingSoon` e aparecem com "Em breve" no menu (`soon: true` em `components/layout/nav.ts`).

## Hospedagem e portabilidade

| Peça | Onde roda hoje | Como trocar |
| --- | --- | --- |
| Frontend | **Vercel** | O build detecta a Vercel sozinho; em outro lugar, `NITRO_PRESET` (ex.: `node-server`, `netlify`). |
| API | Container (`backend/Dockerfile`) no **Render** (`render.yaml`) | Qualquer serviço que rode Docker (Railway, Fly.io, Cloud Run, servidor próprio). |
| Catálogo (metadados) | **Supabase Postgres** | Qualquer Postgres: trocar `DATAPULSE_DATABASE_URL` e rodar `make migrar`. |
| Arquivos (Parquet) | **Supabase Storage**, pelo protocolo S3 | Qualquer S3 (AWS, Cloudflare R2...): trocar `DATAPULSE_S3_*`. |
| Login (Sprint 5) | Supabase Auth | A API valida o token pelo padrão JWT. |

Regras que mantêm isso verdade:

- O código **não usa SDK de provedor**: Postgres via `psycopg` com SQL padrão, arquivos via `boto3` (S3).
- O **Frontend só fala com a nossa API**, nunca direto com o banco.
- Cada peça trocável tem uma **porta** (contrato) e adaptadores: `shared/arquivos/` (pasta local,
  S3) e `features/datasets/catalogo/` (JSON local, Postgres). Os adaptadores passam pelos **mesmos
  testes de contrato**; os de nuvem rodam com `make test-integracao` (Postgres e S3 no Docker).
- Sem `DATAPULSE_DATABASE_URL`/`DATAPULSE_S3_BUCKET`, tudo roda em `backend/storage/` (desenvolvimento).
- Migrações em SQL puro em `backend/migrations/`, numeradas, aplicadas uma vez (`schema_migrations`).
  Não usamos `Frontend/supabase/`, que é área gerenciada pelo Lovable.
- Configuração só por variáveis de ambiente (`backend/.env` em desenvolvimento, painel da
  hospedagem em produção). Modelo em `backend/.env.example`.

## Backend em vertical slices

Cada **funcionalidade** é uma pasta com tudo o que ela precisa (rota, regra e contrato), em vez de
espalhar uma funcionalidade por pastas técnicas (`routes/`, `services/`, `schemas/`...).

```
backend/app/
├── main.py                    # monta o app: CORS, erros → HTTP, registra as features
├── preparar.py                # make migrar: aplica migrações e cria o bucket
├── shared/                    # o que qualquer feature pode usar
│   ├── config.py              # Settings (variáveis DATAPULSE_*, lidas também de backend/.env)
│   ├── arquivos/              # porta de arquivos: pasta_local.py, bucket_s3.py
│   ├── banco/                 # conexão Postgres e migrações (SQL em backend/migrations/)
│   ├── errors.py              # categorias de erro: NaoEncontrado (404), EntradaInvalida (422), LimiteExcedido (413)
│   └── api_model.py           # base dos contratos (JSON em camelCase)
└── features/
    ├── health/endpoint.py     # GET /api/health
    └── datasets/
        ├── models.py          # Dataset e DatasetMeta (usados por várias fatias)
        ├── errors.py          # DatasetNaoEncontrado, ArquivoInvalido, ArquivoMuitoGrande
        ├── catalogo/          # porta do catálogo: arquivos_json.py, postgres.py
        ├── filtragem.py       # filtros exatos e faixas (usados por linhas/ e agregar/)
        ├── repository.py      # junta catálogo + arquivos (+ cache); é o que as fatias usam
        ├── dependencies.py    # monta o repositório conforme a configuração
        ├── importar/          # POST /upload → endpoint, caso_de_uso, leitura_csv, datas
        ├── listar/            # GET  /
        ├── obter/             # GET  /{id}
        ├── remover/           # DELETE /{id}
        ├── linhas/            # GET  /{id}/rows → endpoint, consulta
        ├── estatisticas/      # GET  /{id}/stats → endpoint, perfil
        └── agregar/           # GET  /{id}/aggregate → endpoint, agregacao (Dashboard)
```

Regras:

1. **Uma fatia não importa outra fatia.** O que duas fatias precisam vai para a raiz da feature
   (`models.py`, `repository.py`...); o que duas features precisam vai para `shared/`.
2. **Contrato mora com quem usa.** `PaginatedRows` só existe em `linhas/`; `ColumnStats` só em
   `estatisticas/`. Sobe para `models.py` quando uma segunda fatia precisar.
3. **Endpoint fino.** O `endpoint.py` traduz HTTP ↔ Python. Regras com mais de poucas linhas
   ficam num módulo ao lado (`caso_de_uso.py`, `consulta.py`), testável sem HTTP.
4. **Erros por categoria.** Cada erro herda de uma categoria de `shared/errors.py`, que define o
   status HTTP. O `main.py` não conhece erros de nenhuma feature.
5. **Testes espelham as fatias:** `tests/features/datasets/test_importar.py` e assim por diante.

### Como criar uma nova fatia

1. Crie `app/features/<feature>/<fatia>/endpoint.py` com um `router = APIRouter()`.
2. Registre o router no `__init__.py` da feature.
3. Crie `tests/features/<feature>/test_<fatia>.py`.

## Frontend em vertical slices

As rotas em `src/routes/` (exigidas pelo TanStack Start) são **cascas finas**: título da página,
parâmetros da URL e qual componente mostrar. A tela de verdade mora na feature, com as mesmas fatias
do backend:

```
Frontend/src/
├── routes/                     # casca: head + validateSearch + componente da feature
├── features/datasets/
│   ├── types.ts                # contratos (espelham o backend) e regras pequenas (canExplore...)
│   ├── queries.ts              # React Query: chaves de cache e hooks (useDatasets, useRemoveDataset...)
│   ├── api/                    # datasets-api.ts (interface) e http-datasets-api.ts
│   ├── components/             # usados por mais de uma fatia (StatusBadge, DatasetPicker, DatasetPage)
│   ├── listar/                 # tela Meus Datasets
│   ├── importar/               # tela Importar
│   ├── explorar/               # tela Explorador
│   ├── resumo/                 # Visão Geral (página inicial): números e atividade recente
│   └── painel/                 # Dashboard: dashboard-config.ts (regras) + painéis
├── features/configuracoes/     # tema e situação da conexão com a API
├── components/ui, components/layout   # visual compartilhado (shadcn + layout do app)
├── components/charts/          # gráficos genéricos (Recharts): TrendChart, BarListChart, DonutChart
└── lib/                        # utilidades sem regra de negócio (http, format, theme)
```

Mesmas regras do backend: uma fatia não importa outra (o que é dividido sobe para a raiz da
feature); lógica que dá para testar sem tela fica em `.ts` ao lado do componente
(`filter-datasets.ts`, `rows-query-state.ts`, `preview.ts`), com o teste junto (`*.test.ts`).
Nomes de pastas em português (iguais às fatias do backend); componentes e funções em inglês, como no
restante do código gerado pelo Lovable.

Relatórios (Sprint 5) e Assistente (Sprint 6) mostram "Em breve" até virarem features.

## Contrato da API

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/api/health` | `{status, version}` |
| GET | `/api/datasets` | `Dataset[]` (mais recentes primeiro) |
| POST | `/api/datasets/upload` | `Dataset` (201). Multipart: `file`, opcionais `description`, `separator`, `encoding` |
| GET | `/api/datasets/{id}` | `Dataset` |
| DELETE | `/api/datasets/{id}` | 204 |
| GET | `/api/datasets/{id}/rows` | `PaginatedRows`. Parâmetros: `page` (começa em 1), `page_size` (máx. 1000), `search`, `filters` (JSON `{"coluna": "valor exato"}`), `ranges` (JSON `{"coluna": {"min": 100, "max": "2026-01-31"}}`, só colunas de número ou data; qualquer lado pode faltar; data sem hora inclui o dia inteiro), `sort` (coluna), `order` (`asc`/`desc`). `total` conta as linhas filtradas. Ordem: filtros → faixas → busca → ordenação → página. |
| GET | `/api/datasets/{id}/stats` | `ColumnStats[]`. `type`: `texto`, `número`, `moeda`, `percentual` (valores em fração: 0,15 = 15%), `data` ou `categoria`. Colunas `categoria` trazem `values` (opções de filtro); as numéricas, `min`/`max`/`mean`; as de `data`, `start`/`end` (ISO). |
| GET | `/api/datasets/{id}/aggregate` | `Aggregation` = `{overall, groups, other}`, cada um com `count`, `sum`, `mean`, `min`, `max` (só `count` sem medida). Parâmetros: `measure` (coluna numérica), `group_by` (data → períodos em ordem; texto → categorias da maior para a menor), `interval` (`dia`/`semana`/`mes`/`trimestre`/`ano`; máx. 1000 períodos), `limit` (categorias, 1–50; o resto vai em `other`), `filters`, `ranges`. `key` do grupo: nome da categoria (vazios = `(vazio)`) ou início do período (`2026-01-01`). |

**Busca (`search`)** depende do tipo da coluna: texto → "contém" (sem diferenciar maiúsculas);
número → igual, se o termo for número (`45,50` ou `45.5`); data → mesmo dia, se o termo for data
(`05/01/2026` ou `2026-01-05`). Não converter números e datas em texto mantém a busca rápida
(~0,2 s com 1 milhão de linhas).

Erros esperados respondem `{"detail": "mensagem"}`: 404 (dataset não existe), 413 (arquivo acima
de `DATAPULSE_MAX_UPLOAD_MB`), 422 (arquivo ilegível, vazio, formato não suportado, ou
busca/filtro/faixa com coluna inexistente ou valor inválido). A
documentação interativa fica em `http://localhost:8000/docs` (a raiz `/` redireciona para lá).

Ao mudar um contrato, altere juntos o modelo Python da fatia e `Frontend/src/features/datasets/types.ts`.

## Fluxo de importação

1. O Frontend valida uma prévia no navegador (Papa Parse, só as primeiras linhas). Arquivos
   `.zip`/`.gz` não têm prévia: vão direto para a API.
2. Ao concluir, envia o arquivo para `POST /api/datasets/upload`.
3. A API copia o upload para a pasta temporária do sistema respeitando o limite de tamanho,
   detecta encoding (utf-8 → latin-1) e separador (`, ; tab |`) e lê **tudo como texto**.
4. Converte, nesta ordem: **números** (`importar/numeros.py`: `1.234,56`, `1,234.56`, `R$`, `%`,
   negativos contábeis; `1.500` segue a convenção do arquivo: brasileira se o separador for `;`;
   códigos com zero à esquerda e números com 16+ dígitos ficam como texto) e depois **datas**
   (`importar/datas.py`; texto só com dígitos nunca vira data). Colunas com R$ ou % ficam anotadas em
   `df.attrs["datapulse_tipos"]`, que o Parquet preserva.
5. Os dados vão para o armazenamento de arquivos (Parquet) e os metadados para o catálogo, nessa
   ordem, para nunca aparecer um dataset sem dados.
6. Leituras posteriores (linhas, estatísticas) usam um cache LRU dos últimos DataFrames.

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
