# Passo 1: Agregação na API

## O que é "agregar"

Agregar é resumir muitas linhas em poucos números. Por exemplo, numa planilha de 3.000 vendas:

- **geral:** "o total vendido foi R$ 9 milhões em 3.000 registros";
- **por período:** "janeiro: R$ 305 mil; fevereiro: R$ 375 mil..." (é o que vira o gráfico de evolução);
- **por categoria:** "Recife: R$ 2 milhões; Curitiba: R$ 1,8 milhão..." (vira o gráfico de barras).

Para cada grupo a API devolve de uma vez: **contagem, soma, média, mínimo e máximo**. O site escolhe
qual mostrar, conforme o "Cálculo" escolhido.

## O endereço novo

`GET /api/datasets/{id}/aggregate`

| Parâmetro | O que é | Exemplo |
| --- | --- | --- |
| `measure` | A coluna de número a resumir. Sem ela, só conta registros. | `Total` |
| `group_by` | Agrupar por uma coluna de **data** (vira períodos) ou de **texto/categoria** | `Data` ou `Filial` |
| `interval` | O tamanho do período, quando agrupa por data | `dia`, `semana`, `mes`, `trimestre`, `ano` |
| `limit` | Quantas categorias mostrar. As outras viram **"outros"**, somadas | `8` |
| `filters`, `ranges` | Os mesmos filtros do Explorador (valor exato e faixa) | `{"Data": {"min": "2026-01-01"}}` |

Regras que evitam resultados estranhos:

- Categorias vêm **da maior para a menor**; períodos, **em ordem de data**.
- A semana começa na **segunda-feira**.
- Valores vazios **não entram** na soma nem na média (mas a linha conta como registro).
- Um grupo sem nenhum valor tem soma **vazia**, não zero.
- Pedidos sem sentido (medir uma coluna de texto, agrupar por números) recebem uma explicação.
- Mais de 1.000 períodos (ex.: 10 anos por dia) pedem um intervalo maior, para o gráfico não travar.

## Rápido com arquivos grandes

O pandas calcula todos os grupos **de uma vez**, sem passar linha por linha. Com 1 milhão de linhas:

| Pedido | Tempo |
| --- | --- |
| Geral | 0,01 s |
| Por mês (24 meses) / por dia (730 dias) | 0,09 s / 0,16 s |
| Por filial (8) / por produto (300) | 0,09 s / 0,11 s |
| Por cliente (200 mil diferentes) | 0,77 s |

## Uma arrumação de vertical slice

Os filtros (valor exato e faixa) moravam dentro da fatia `linhas/`. Como a fatia nova `agregar/`
também precisa deles, e **uma fatia não pode importar outra**, eles subiram para a raiz da feature:
`backend/app/features/datasets/filtragem.py`. Nada mudou por fora: os 82 testes antigos continuaram
passando antes de qualquer coisa nova ser escrita.

As estatísticas (`/stats`) também ganharam a **primeira e a última data** de cada coluna de data.
O Dashboard usa isso nos atalhos "últimos 3 meses" e para sugerir o intervalo.

**Testes:** `backend/tests/features/datasets/test_agregar.py`, 17 testes.
