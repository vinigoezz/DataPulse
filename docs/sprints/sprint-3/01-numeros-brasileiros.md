# Passo 1: Números brasileiros

## O problema

O computador, por padrão, pensa como americano: `1,234.56` é mil duzentos e trinta e quatro e
cinquenta e seis centavos. No Brasil é o contrário: `1.234,56`. Até aqui, a API lia `45,50` como
**texto**, e não dava para somar, tirar média nem ordenar direito. Pior: `1.500` era lido como
**um e meio**.

## Como a API decide agora

Na importação, a API passou a ler **tudo como texto** e decide sozinha, coluna por coluna, o que
cada uma é. Ela olha as primeiras 1.000 linhas e, se **90% ou mais** dos valores tiverem cara de
número, converte a coluna inteira.

| Escrito na planilha | Vira | Tipo da coluna |
| --- | --- | --- |
| `45,50` · `1.234,56` · `-3` | 45,5 · 1234,56 · −3 | número |
| `1,234.56` · `45.5` (padrão americano) | 1234,56 · 45,5 | número |
| `R$ 1.234,56` · `-R$ 10,00` | 1234,56 · −10 | **moeda** |
| `15%` · `12,5 %` | 0,15 · 0,125 (guardado como fração) | **percentual** |
| `(1.000,00)` (negativo de contador) | −1000 | número |
| `1 234,5` (espaço como milhar, comum no Excel) | 1234,5 | número |

Valores que destoam (um `n/d` no meio de números) ficam **vazios**, desde que sejam poucos (até 10%).
Se forem muitos, a coluna continua texto, para não perder informação.

### O caso ambíguo: `1.500`

`1.500` pode ser "mil e quinhentos" (Brasil) ou "um e meio" (EUA). A API resolve pelo **separador
de colunas** do arquivo: CSV com `;` é coisa de Excel brasileiro, então vale o padrão brasileiro;
CSV com `,` segue o americano.

### O que **não** pode virar número

Alguns textos parecem número, mas são **códigos**. Se virassem número, perderiam informação:

| Exemplo | Por que continua texto |
| --- | --- |
| `00123` (código de produto) | Viraria 123 e perderia os zeros |
| `12345678901234567` (cartão, chave) | Números com 16+ dígitos perdem precisão |
| `123.456.789-00` (CPF) · `01310-100` (CEP) | Têm traço, não têm cara de número |

### Como a "moeda" é lembrada

Depois de converter `R$ 1.234,56` em 1234,56, o símbolo some. Para não esquecer que era dinheiro, a
API grava uma **anotação** junto com os dados ("esta coluna é moeda"). O formato Parquet guarda essa
anotação, e as estatísticas a usam para dar o tipo certo. Colunas sem `R$`, mas com nomes como
"receita", "valor" ou "preço", continuam sendo tratadas como moeda, como antes.

## No site

- O tipo novo **percentual** ganhou ícone (`%`) e aparece como `15,0%`.
- A formatação de valores (R$, %, datas, números) foi reunida num só lugar,
  `explorar/format-value.ts`, usado pela tabela, pelos cartões e pelas etiquetas de filtro.

## Onde está no código

| Arquivo | Papel |
| --- | --- |
| `backend/app/features/datasets/importar/numeros.py` | Toda a regra acima |
| `backend/app/features/datasets/importar/leitura_csv.py` | Lê como texto e chama números → datas, nessa ordem |
| `backend/app/features/datasets/estatisticas/perfil.py` | Usa a anotação para dar o tipo moeda/percentual |
| `backend/tests/features/datasets/test_numeros.py` | 15 testes com os casos da tabela |
