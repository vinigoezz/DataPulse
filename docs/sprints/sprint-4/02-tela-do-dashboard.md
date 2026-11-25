# Passo 2: A tela do Dashboard

## O que aparece

1. **Barra de escolhas**
   - **Medida:** a coluna de valor, ou "Registros (contagem)".
   - **Cálculo:** soma, média, mínimo ou máximo.
   - **Data**, **Agrupar a data por** (dia, semana, mês...) e **Período** (todo, últimos 30 dias,
     3 meses, 12 meses).
   - **Comparar por:** a categoria.
2. **Cartões:** total, média, maior valor e número de registros. Para percentuais o "total" não
   faz sentido, e aparece o menor valor no lugar.
3. **Evolução:** o gráfico de área ao longo do tempo.
4. **Comparação:** barras com as 8 maiores categorias (o resto em "Outros"), e uma rosca com a
   participação de cada uma no total.
   - A rosca só aparece quando faz sentido somar as partes (soma ou contagem, valores positivos).
   - A média de "Outros" não é mostrada, porque confundiria.

## Ele se monta sozinho

Ao abrir um dataset, o Dashboard escolhe:

| Escolha | Regra |
| --- | --- |
| Medida | A primeira coluna de **moeda**; se não houver, de **número**; se não houver, de **percentual** |
| Cálculo | **Soma**; para percentual, **média** (somar 10% + 20% não é 30% de nada) |
| Data | A primeira coluna de data |
| Intervalo | Pelo tamanho do período do arquivo: até 45 dias → dia; até ~7 meses → semana; até 3 anos → mês; até 8 anos → trimestre; mais → ano |
| Comparar por | A primeira **categoria**; se não houver, um texto com até 100 valores diferentes |

Se o dataset não tiver nenhuma coluna de número, data ou categoria, a tela explica isso em vez de
mostrar gráficos vazios.

Os "últimos 3 meses" contam a partir da **última data do arquivo**, não de hoje. Numa planilha de
2025, "últimos 3 meses" mostra o fim de 2025, e não fica vazio.

## Por dentro (vertical slice)

```
Frontend/src/features/datasets/painel/
├── dashboard-config.ts      ← as regras acima, sem tela (14 testes)
├── DashboardPage.tsx        ← a página (usa o DatasetPage compartilhado)
├── DatasetDashboard.tsx     ← carrega as colunas e guarda as escolhas
├── DashboardControls.tsx    ← a barra de escolhas
├── KpiCards.tsx             ← os cartões
├── TrendPanel.tsx           ← o gráfico de evolução
└── BreakdownPanel.tsx       ← barras + rosca
```

Duas arrumações que vieram junto:

- **`components/DatasetPage.tsx`:** o Explorador e o Dashboard faziam a mesma coisa: carregar a
  lista, mostrar erro, "nenhum dataset" e o seletor. Agora isso existe uma vez só e as duas telas
  usam.
- **Gráficos genéricos:** os gráficos que vieram do Lovable tinham "receita" e "custo" escritos
  dentro deles. Viraram `TrendChart`, `BarListChart` e `DonutChart`, que recebem nome, valor e
  **como formatar** (R$, %, número). Servem para qualquer planilha.

O endereço da página guarda o dataset aberto (`/dashboard?dataset=...`), então dá para salvar nos
favoritos.
