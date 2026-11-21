# Passo 2: Frontend organizado em vertical slices

No Sprint 0 o backend foi reorganizado “por receita” (uma pasta por funcionalidade). Agora o site
recebeu a mesma organização, **com os mesmos nomes**, para que quem conhece um lado se ache no outro.

## Antes

Cada tela era **um arquivo gigante** dentro de `src/routes/`. A tela Meus Datasets tinha 185 linhas
misturando filtros, tabela, cartões, menu de ações, janela de detalhes e confirmação de remoção. O
Explorador tinha 197. Para mudar o botão de remover, era preciso ler a tela inteira.

## Depois

```
Frontend/src/
├── routes/              ← “porteiros”: só dizem o título da página e qual tela mostrar
└── features/datasets/
    ├── listar/          ← tela Meus Datasets, em 8 arquivos pequenos
    ├── importar/        ← tela Importar
    ├── explorar/        ← tela Explorador
    ├── api/             ← quem busca os dados (passo 3)
    ├── queries.ts       ← memória dos dados já buscados (passo 3)
    ├── types.ts         ← o formato dos dados (igual ao do backend)
    └── components/      ← peças usadas por mais de uma tela (a etiqueta de status)
```

Comparando com o backend:

| Backend (`backend/app/features/datasets/`) | Frontend (`Frontend/src/features/datasets/`) |
| --- | --- |
| `listar/`, `obter/`, `remover/` | `listar/` (a tela faz as três coisas) |
| `importar/` | `importar/` |
| `linhas/`, `estatisticas/` | `explorar/` (a tela usa as duas) |
| `models.py` | `types.ts` |

## Por que as rotas viraram “porteiros”

O TanStack Start (a ferramenta do site) exige que cada página tenha um arquivo em `src/routes/`. Em
vez de colocar a tela inteira ali, o arquivo de rota agora tem cerca de 15 linhas: o título da aba
do navegador e “mostre a tela X”. Por exemplo, `routes/datasets.tsx` só diz “mostre `DatasetsPage`”.

## Como uma tela foi dividida (exemplo: Meus Datasets)

| Arquivo | Responsabilidade |
| --- | --- |
| `DatasetsPage.tsx` | O **maestro**: decide o que mostrar (carregando, erro, vazio, tabela ou cartões). |
| `DatasetsToolbar.tsx` | Busca, filtro de status, ordem e troca tabela/cartões. |
| `DatasetsTable.tsx` / `DatasetsGrid.tsx` | As duas formas de mostrar a lista. |
| `DatasetActions.tsx` | O menu “…” de cada linha. |
| `DatasetDetailSheet.tsx` | A janela lateral de detalhes. |
| `RemoveDatasetDialog.tsx` | A confirmação de remoção (e a remoção em si). |
| `filter-datasets.ts` | A **regra** de busca/filtro/ordem, sem nada visual, por isso fácil de testar. |
| `filter-datasets.test.ts` | Os testes dessa regra, ao lado dela. |

## Regras (as mesmas do backend)

1. **Uma fatia não usa código de outra.** Exemplo real: a regra “só dá para explorar dataset
   processado” (`canExplore`) nasceu em `listar/`, mas o Explorador também precisou dela. Ela
   **subiu** para `types.ts`, na raiz da feature.
2. **Regra separada da tela.** Tudo que dá para testar sem desenhar nada fica num arquivo `.ts`
   ao lado (`filter-datasets.ts`, `rows-query-state.ts`, `preview.ts`).
3. **Testes ao lado do código** (`*.test.ts`), para não esquecer de atualizar um quando mudar o outro.
4. **Nomes:** pastas em português (iguais ao backend); componentes e funções em inglês, como o
   resto do código do Lovable.

## O que ainda não foi migrado

Dashboard, Relatórios e Configurações continuam em `routes/` com dados de demonstração. Eles viram
features quando forem ligados à API (sprints 4 e 5).

## Arquivos removidos

- `src/hooks/use-datasets.ts`: a lista falsa em memória (substituída pelo passo 3)
- `src/services/datasets.service.ts`: o antigo acesso a dados (substituído pela pasta `api/`)
- `src/services/http.ts` foi para `src/lib/http.ts` (é uma ferramenta genérica, não uma feature)
