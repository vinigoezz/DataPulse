# Guia de desenvolvimento

Para quem vai programar no DataPulse: instalar, rodar, testar e criar funcionalidades seguindo os
padrões do projeto. A organização completa do código e o contrato da API estão em
[ARQUITETURA.md](ARQUITETURA.md).

## Tecnologias

| Parte | Tecnologias |
| --- | --- |
| API (`backend/`) | Python 3.12+, FastAPI, pandas, pyarrow (Parquet), psycopg (Postgres), boto3 (S3), python-calamine (Excel) |
| Site (`Frontend/`) | React 19, TanStack Start/Router, TanStack Query (React Query), Tailwind, shadcn/ui, Recharts, Papa Parse, Vite + Nitro, bun |
| Qualidade | pytest, ruff (API); vitest, ESLint, Prettier, TypeScript estrito (site) |
| Infra | Docker, docker-compose (Postgres + S3 locais para testes), Render, Vercel, Supabase |

## Primeiros passos

Requisitos: Python 3.12+, Node 20+, [bun](https://bun.sh) (`npm install -g bun`) e, para os
testes de integração, Docker.

```bash
make setup   # cria .venv, instala dependências, cria backend/.env e Frontend/.env.local
make dev     # sobe a API (http://localhost:8000/docs) e o site juntos
```

> **Atenção:** se o `backend/.env` tiver as chaves do Supabase, o `make dev` usa o **banco de
> produção**. Para desenvolver sem afetar o site no ar, deixe vazias, no `backend/.env`, as
> linhas `DATAPULSE_DATABASE_URL` e `DATAPULSE_S3_BUCKET`: tudo passa a ficar em
> `backend/storage/`.

## Comandos (`make`)

| Comando | O que faz |
| --- | --- |
| `make setup` | Instala tudo (uma vez) |
| `make dev` | API + site juntos (Ctrl+C encerra os dois) |
| `make api` / `make web` | Só a API / só o site |
| `make test` | Testes da API (só peças locais) e do site |
| `make test-integracao` | Testes da API também contra Postgres e S3 no Docker |
| `make servicos` / `make servicos-parar` | Liga/desliga o Postgres e o S3 locais (Docker) |
| `make lint` | ruff (API) + ESLint (site) |
| `make format` | Formata a API (ruff). Site: `cd Frontend && bunx prettier --write src` |
| `make migrar` | Aplica migrações e cria o bucket no banco configurado em `backend/.env` |
| `make render-segredos` | Testa os segredos do `backend/.env` e envia ao Render |

## Organização: vertical slices

O código é organizado **por funcionalidade**, não por tipo de arquivo. Cada funcionalidade (fatia)
tem tudo o que precisa numa pasta só, com os mesmos nomes na API e no site:

| Fatia | API (`backend/app/features/datasets/`) | Site (`Frontend/src/features/datasets/`) |
| --- | --- | --- |
| Importar | `importar/` | `importar/` |
| Listar / remover / obter | `listar/`, `remover/`, `obter/` | `listar/` |
| Linhas (Explorador) | `linhas/` | `explorar/` |
| Estatísticas | `estatisticas/` | `explorar/` (cartões e perfil) |
| Agregação (Dashboard) | `agregar/` | `painel/` |
| Visão Geral | — (usa a lista) | `resumo/` |

### As regras

1. **Uma fatia não importa outra.** O que duas fatias usam sobe para a raiz da feature (ex.:
   `datasets/filtragem.py`, `datasets/models.py`, `features/datasets/components/`). O que duas
   features usam vai para `app/shared/` (API) ou `src/components/`, `src/lib/` (site).
2. **Endpoint e rota finos.** `endpoint.py` só traduz HTTP ↔ Python; arquivos em `src/routes/`
   só definem título, parâmetros da URL e qual tela mostrar. A regra mora num módulo ao lado.
3. **Regra testável sem tela nem HTTP.** Lógica fica em arquivos `.py`/`.ts` próprios
   (`numeros.py`, `agregacao.py`, `dashboard-config.ts`, `range-input.ts`...), com o teste junto.
4. **Erros por categoria.** Erros da API herdam de `app/shared/errors.py` (`NaoEncontrado` → 404,
   `EntradaInvalida` → 422, `LimiteExcedido` → 413) e respondem `{"detail": "mensagem em
   português"}`. O `main.py` não conhece erros de nenhuma feature.
5. **Contratos espelhados.** Modelos da API (JSON em camelCase via `ApiModel`) e
   `Frontend/src/features/datasets/types.ts` mudam juntos.
6. **Nomes:** pastas e código da API em português (como as fatias); componentes e funções do site
   em inglês, como o restante do código gerado pelo Lovable.

### Peças trocáveis (portas e adaptadores)

| Porta (contrato) | Adaptadores | Escolha |
| --- | --- | --- |
| `app/shared/arquivos/porta.py` | `pasta_local.py`, `bucket_s3.py` | `DATAPULSE_S3_BUCKET` definido → S3 |
| `features/datasets/catalogo/porta.py` | `arquivos_json.py`, `postgres.py` | `DATAPULSE_DATABASE_URL` definido → Postgres |

As fatias só usam o `DatasetRepository`, que junta as duas portas. Os adaptadores passam pelos
**mesmos testes de contrato** (`tests/shared/test_arquivos.py`, `tests/features/datasets/test_catalogo.py`).

## Receitas

### Criar uma fatia nova na API

1. Crie `backend/app/features/datasets/<fatia>/` com `__init__.py`, `endpoint.py` (um
   `router = APIRouter()`) e o módulo da regra.
2. Registre em `backend/app/features/datasets/__init__.py` (tupla `for fatia in (...)`).
3. Testes em `backend/tests/features/datasets/test_<fatia>.py` (use as fixtures `client` e
   `dataset_vendas` de `tests/conftest.py`).
4. Documente o endereço na tabela "Contrato da API" de `docs/ARQUITETURA.md`.

### Mudar o banco

Crie `backend/migrations/000N_descricao.sql` (SQL puro, Postgres padrão; **nunca** edite um que
já rodou). Se criar tabela nova, ligue o RLS (`alter table ... enable row level security;`).
Aplique com `make migrar`; em produção, a API aplica sozinha ao ligar.

### Criar uma tela no site

1. A tela vai em `Frontend/src/features/<feature>/<fatia>/` (componente da página + regras em
   `.ts` com teste `.test.ts`).
2. Chamadas à API: acrescente o método em `api/datasets-api.ts` e `api/http-datasets-api.ts`, e um
   hook em `queries.ts` (React Query, com chave em `datasetKeys`).
3. A rota em `Frontend/src/routes/<nome>.tsx` só aponta para o componente (o
   `routeTree.gen.ts` é gerado sozinho: não edite).
4. Item de menu em `src/components/layout/nav.ts` (`soon: true` + `ComingSoon` enquanto não estiver
   pronto).
5. Estados obrigatórios: carregando (`Skeleton`), erro (`ErrorState` com **Tentar novamente**) e
   vazio (`EmptyState` com o próximo passo).

## Testes

| Onde | Como rodar | O que cobre |
| --- | --- | --- |
| `backend/tests/` | `make test` | Cada fatia pela API, conversão de números/datas/Excel, filtros, agregação, CORS, migrações |
| `backend/tests/` (integração) | `make test-integracao` | Os mesmos contratos contra Postgres e S3 reais (Docker) |
| `Frontend/src/**/*.test.ts` | `make test` | Regras das telas: filtros, faixas, Dashboard, parâmetros enviados à API |

Arquivos de exemplo para testes ficam em `backend/tests/fixtures/` (ex.: `vendas_brasil.csv`, no
formato que o Excel brasileiro gera). Os testes **nunca** usam o Supabase de produção.

## Cuidados com o Lovable

A pasta `Frontend/` está ligada ao Lovable (veja `Frontend/AGENTS.md`):

- Não reescreva histórico já enviado (`push --force`, `rebase` de commits publicados).
- Não crie `Frontend/supabase/` (área do Lovable); migrações ficam em `backend/migrations/`.
- Não edite arquivos com cabeçalho "gerado automaticamente".
- Componentes em `src/components/ui/` vêm do shadcn/Lovable (os 9 avisos de ESLint restantes são
  deles).

## Documentar cada passo

Cada passo de cada sprint ganha um arquivo em `docs/sprints/sprint-N/`, explicando **para leigos**
o que mudou, por quê e como testar. Atualize também `docs/ROADMAP.md` e, se mudar contrato ou
estrutura, `docs/ARQUITETURA.md`.
