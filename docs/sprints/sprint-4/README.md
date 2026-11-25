# Sprint 4: Dashboard de verdade

**Objetivo:** montar gráficos e indicadores a partir de **qualquer** planilha importada.

**Resultado:** o menu **Dashboard** deixou de ser "Em breve". Você escolhe um dataset e o
Dashboard já abre com uma configuração sugerida: a coluna de valor, a de data e a de categoria.
Dá para mudar tudo: o que medir, como calcular, o período e a comparação.

## Os passos

| # | Passo | Em uma frase |
| --- | --- | --- |
| 1 | [Agregação na API](01-agregacao-na-api.md) | A API aprendeu a calcular totais, médias e contagens: geral, por mês (ou dia, semana...) e por categoria. |
| 2 | [A tela do Dashboard](02-tela-do-dashboard.md) | Cartões e gráficos que se montam sozinhos a partir das colunas do arquivo. |
| 3 | [Aposentar o Streamlit](03-aposentar-streamlit.md) | O protótipo original saiu: o site novo já faz o que ele fazia (quase tudo). |

## Como testar você mesmo

1. Abra o site e vá em **Dashboard**. Ele abre o dataset mais recente (o seletor no topo troca).
2. Confira os 4 cartões (total, média, maior valor e registros) e os gráficos.
3. Mude **Medida** (por exemplo, para "Registros (contagem)"), **Período** ("Últimos 3 meses") e
   **Comparar por** (outra categoria). Tudo se recalcula na API.
4. Lembre: planilhas importadas **antes do Sprint 3** têm os valores como texto e não aparecem como
   medida. Importe de novo para aproveitar.
