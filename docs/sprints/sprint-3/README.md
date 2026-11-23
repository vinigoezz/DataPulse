# Sprint 3: Dados brasileiros

**Objetivo:** o DataPulse entender planilhas do jeito que elas são no Brasil: vírgula como
decimal, ponto como milhar, `R$`, `%` e datas `dd/mm/aaaa`.

**Resultado:** ao importar, colunas como `R$ 1.234,56` viram **moeda**, `15%` vira **percentual** e
`1.200` vira **número** (mil e duzentos). Médias, mínimos e máximos passam a funcionar, e o
Explorador ganhou o filtro **"entre X e Y"**.

## Os passos

| # | Passo | Em uma frase |
| --- | --- | --- |
| 1 | [Números brasileiros](01-numeros-brasileiros.md) | A API passou a ler vírgula decimal, ponto de milhar, R$ e %, sem estragar códigos como CEP e CPF. |
| 2 | [Filtro por faixa](02-filtro-por-faixa.md) | "Receita entre 100 e 500", "datas de janeiro": na API e no Explorador. |
| 3 | [Teste com um CSV real](03-csv-real.md) | Um arquivo no formato do Excel brasileiro virou teste, e achou um bug antigo. |
| 4 | [Desempenho](04-desempenho.md) | Medimos com 1 milhão de linhas e deixamos a busca 20 vezes mais rápida. |

## Importante: datasets antigos

A conversão acontece **na importação**. Arquivos importados antes deste sprint continuam com os
números como texto. Para aproveitar as melhorias, **importe de novo** (e apague o antigo).

## Como testar você mesmo

1. Abra o site e importe uma planilha sua com valores em R$ ou com vírgula decimal.
2. No **Explorador**, os valores aparecem alinhados à direita e formatados (`R$ 1.234,56`, `15,0%`),
   e os cartões do topo mostram média, mínimo e máximo.
3. Clique no ícone de filtro ao lado do nome de uma coluna de valor ou de data, preencha
   "mínimo" e/ou "máximo" e clique em **Aplicar**. Aparece uma etiqueta acima da tabela; clique nela
   para remover o filtro.
4. Na busca, digite um valor (`45,50`) ou uma data (`05/01/2026`).
