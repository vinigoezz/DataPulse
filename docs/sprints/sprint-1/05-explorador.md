# Passo 5: Explorador com dados reais

## O que mudou para quem usa

| Antes | Agora |
| --- | --- |
| Só mostrava um arquivo de exemplo | Mostra qualquer dataset processado; um seletor no topo troca de dataset |
| Busca, filtro e ordem feitos no navegador, sobre dados inventados | Feitos **pelo servidor**, sobre o arquivo real |
| Colunas fixas | Colunas e tipos vêm da análise da API (texto, número, moeda, data, categoria) |
| | Uma coluna `#` mostra o número de cada linha no arquivo filtrado |

## Por que o servidor faz a busca

Imagine uma planilha de 2 milhões de linhas. Para buscar no navegador, seria preciso **baixar o
arquivo inteiro** para o seu computador antes. Lento e pesado. Com a busca no servidor, o navegador
manda só o pedido (“linhas com ‘café’, da filial Recife, ordenadas por receita, página 3”) e recebe
só as 25 linhas daquela página.

## A parte do backend (fatia `linhas/`)

O endereço `GET /api/datasets/{id}/rows` ganhou novos parâmetros:

| Parâmetro | Exemplo | O que faz |
| --- | --- | --- |
| `search` | `café` | Linhas que contêm o texto em qualquer coluna (maiúsculas não importam) |
| `filters` | `{"filial": "Recife"}` | Só linhas com exatamente esse valor nessa coluna |
| `sort` / `order` | `receita` / `desc` | Ordena por uma coluna; vazios sempre no fim |
| `page` / `page_size` | `3` / `25` | Qual página e quantas linhas por página |

A ordem das operações é: **filtrar → buscar → ordenar → cortar a página**. O `total` devolvido conta
as linhas depois do filtro e da busca, para o “123 resultados” e o número de páginas ficarem certos.

Se o pedido não faz sentido (ordenar por uma coluna que não existe, filtro mal escrito), a API
responde com erro 422 e uma mensagem clara, em vez de quebrar.

Além disso, as **estatísticas** (`/stats`) agora trazem, para colunas de categoria, a lista de
valores possíveis. É ela que aparece no menu de filtro de cada coluna.

Tudo isso ficou em `backend/app/features/datasets/linhas/consulta.py`, com 8 testes novos.

## A parte do Frontend (fatia `explorar/`)

| Arquivo | Papel |
| --- | --- |
| `ExplorerPage.tsx` | Descobre qual dataset abrir (o da URL, ou o mais recente) e mostra o seletor. |
| `DatasetExplorer.tsx` | Guarda a consulta atual (busca, filtros, ordem, página) e pede os dados. |
| `RowsToolbar.tsx` | Campo de busca, “etiquetas” dos filtros ativos (clique para remover) e contador. |
| `RowsTable.tsx` / `ColumnHeader.tsx` / `CellValue.tsx` | A tabela, o cabeçalho com ordenar/filtrar e a formatação de cada célula (R$, datas, números). |
| `Pagination.tsx` | Linhas por página e navegação. |
| `NumericSummary.tsx` / `ColumnProfile.tsx` | Cartões com médias e o perfil de cada coluna. |
| `rows-query-state.ts` | As regras da consulta, com testes. |

Três detalhes que fazem diferença no uso:

1. **Espera você parar de digitar.** A busca só vai ao servidor 0,3 s depois da última tecla (isso
   se chama *debounce*). Sem isso, digitar “café” faria 4 pedidos.
2. **Mudou a consulta, volta para a página 1.** Se você estava na página 9 e filtrou, talvez nem
   exista mais página 9.
3. **Trocar de dataset zera tudo.** Busca e filtros de um arquivo não fazem sentido em outro.
