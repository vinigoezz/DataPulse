# Passo 4: Desempenho com arquivos grandes

## Como medimos

Geramos planilhas de vendas falsas (só para medir) no formato brasileiro, com **300 mil** e
**1 milhão** de linhas, e cronometramos cada operação. Resultados no Codespaces:

| Operação | 300 mil linhas (19 MB) | 1 milhão de linhas (64 MB) |
| --- | --- | --- |
| Importar (ler + converter números e datas) | 4,5 s | 15 s |
| Guardar / abrir os dados (Parquet) | 0,1 s | 0,2 s |
| Página 1, filtro, faixa, ordenação, estatísticas | até 0,06 s | até 0,26 s |
| **Busca, antes** | **1,0 s** | **3,4 s** |
| **Busca, depois** | **0,07 s** | **0,17 s** |

O Parquet também economiza espaço: o CSV de 64 MB virou 16 MB guardados.

## O que deixava a busca lenta

Para procurar "produto 12", a API transformava **todas** as colunas em texto, inclusive as de
números, e isso custava quase 1 segundo por coluna numérica. Mas procurar "produto 12" dentro de
números não faz sentido.

**Solução:** a busca passou a respeitar o tipo de cada coluna:

| Coluna | Quando entra na busca |
| --- | --- |
| Texto | Sempre: "contém o termo" (como antes) |
| Número, moeda, percentual | Só se o termo for um número: `45,50` acha 45,5 |
| Data | Só se o termo for uma data: `05/01/2026` acha aquele dia |

Resultado: **20 vezes mais rápido**. Como bônus, buscar `45,50` agora encontra o valor 45,5, coisa
que antes não acontecia (o texto guardado era "45.5").

## E o DuckDB?

O plano previa trocar o "motor" de consultas por um banco analítico (DuckDB) **se precisasse**. Com
tudo abaixo de 0,3 s em 1 milhão de linhas, não precisou. Fica a porta aberta para o futuro.

## O limite real hoje: o plano grátis do Render

A API no ar roda com **0,1 CPU e 512 MB** de memória. Por isso:

- o envio está limitado a **25 MB** (cerca de 400 mil linhas como as do teste);
- a importação lá é **mais lenta** que no Codespaces (pode levar perto de um minuto para arquivos
  no limite). Depois de importado, explorar é rápido.

Um plano pago do Render resolve os dois, se o uso crescer.
