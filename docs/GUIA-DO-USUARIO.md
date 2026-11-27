# Guia do usuário

Como usar o DataPulse, tela por tela. Endereço: https://data-pulse-gamma.vercel.app

> **Primeira visita do dia demorando?** A API roda num plano grátis que "dorme" depois de 15
> minutos sem uso. A primeira tela pode levar cerca de **1 minuto** para carregar; depois fica
> rápido. Se aparecer "Não foi possível conectar à API", espere um pouco e clique em
> **Tentar novamente**.

## 1. Prepare sua planilha

| Formato | Aceito? | Observações |
| --- | --- | --- |
| `.csv` | Sim | Separador `,` `;` tab ou `\|` e codificação (UTF-8 ou a do Windows) são detectados sozinhos |
| `.xlsx` (Excel) | Sim | Só a **primeira aba** é importada |
| `.zip` / `.gz` | Sim | Com **um** CSV dentro. Use para arquivos grandes (o CSV encolhe 5 a 10 vezes) |
| `.xls` (Excel antigo) | Não | Abra no Excel e use **Salvar como → .xlsx** |
| `.ods`, `.json`, outros | Não | Converta para CSV ou .xlsx |

**Tamanho máximo no site no ar: 25 MB** (cerca de 400 mil linhas). Acima disso, compacte em `.zip`.

Dicas para o resultado ficar melhor:

- A **primeira linha** deve ter os nomes das colunas.
- Uma coluna = um tipo de informação (só datas, só valores...).
- Linhas e colunas totalmente em branco são ignoradas.

### O que o DataPulse reconhece sozinho

| Na planilha | Vira | Aparece como |
| --- | --- | --- |
| `45,50` · `1.234,56` · `1.200` | número (1.200 = mil e duzentos) | `1.234,56` |
| `R$ 1.234,56` | **moeda** | `R$ 1.234,56` |
| Colunas chamadas "valor", "receita", "preço", "custo", "faturamento" | **moeda** | `R$ ...` |
| `15%` · `12,5 %` | **percentual** | `15,0%` |
| `05/01/2026` · `2026-01-05` | **data** | `05/01/2026` |
| Poucos valores que se repetem (filial, estado, canal) | **categoria** | ganha filtro por valor |
| `00123` · CPF · CEP | **texto** (não perde os zeros) | como está |

Se 1 em cada 10 valores de uma coluna de números for estranho (como `n/d`), ele fica vazio. Se
forem muitos, a coluna continua como texto, para não perder informação.

## 2. Importar

Menu **Importar Dados**:

1. Arraste o arquivo para a área indicada ou clique para escolher.
2. **CSV:** aparece uma **prévia** das primeiras linhas, com avisos se algo parecer errado: uma
   coluna só (separador estranho), colunas sem nome ou repetidas, linhas com tamanhos diferentes. **Excel e compactados** não têm prévia: a API confere ao importar.
3. Se quiser, escreva uma **descrição** (aparece nos detalhes do dataset).
4. Clique em **Concluir importação**. Ao terminar, **Explorar dados** abre o arquivo no Explorador.

## 3. Visão Geral (página inicial)

Os números dos seus dados: **quantos datasets**, **quantos registros** ao todo, **espaço usado** e
a **última importação**, mais a lista das importações recentes (clique no nome para explorar).

## 4. Meus Datasets

A lista de tudo o que você importou.

- **Busca** pelo nome, filtro por **situação** e ordem (**mais recentes** ou **mais antigos**).
- Alterne entre **tabela** e **cartões**.
- Em cada dataset: **Detalhes** (descrição, tamanho, linhas e colunas), **Explorar dados** e
  **Remover**.
- **Remover apaga de verdade** e não tem como desfazer.

## 5. Explorador de Dados

Para olhar as linhas de um dataset. Troque de dataset no seletor do topo.

| Quer... | Faça |
| --- | --- |
| Procurar algo | Digite na **busca**. Texto: encontra "contém". Número (`45,50`): encontra o valor exato. Data (`05/01/2026`): encontra aquele dia. |
| Filtrar por valor (ex.: filial = Recife) | Ícone de filtro ao lado do nome de uma coluna **categoria** |
| Filtrar por faixa (ex.: total entre R$ 100 e R$ 500) | Ícone de filtro em colunas de **número, moeda, %** ou **data** → preencha mínimo e/ou máximo → **Aplicar**. Percentual se digita como na tela: `15` = 15%. "Até 31/01" inclui o dia 31 inteiro. |
| Ordenar | Clique no nome da coluna: crescente → decrescente → sem ordem. Vazios ficam sempre no fim. |
| Remover um filtro | Clique na etiqueta dele, acima da tabela |
| Mudar a quantidade por página | No rodapé: 10, 25, 50 ou 100 linhas |

No topo, cartões com **média, mínimo e máximo** das colunas numéricas. Embaixo, o **perfil de cada
coluna** (tipo, valores distintos, vazios).

## 6. Dashboard

Indicadores e gráficos de um dataset, montados sozinhos a partir das colunas.

**Barra de escolhas:**

| Campo | O que é |
| --- | --- |
| **Medida** | A coluna de valor a analisar, ou **Registros (contagem)** |
| **Cálculo** | Soma, média, mínimo ou máximo |
| **Data** | Qual coluna de data usar no gráfico de evolução |
| **Agrupar a data por** | Dia, semana (começa na segunda), mês, trimestre ou ano |
| **Período** | Todo, últimos 30 dias, 3 meses ou 12 meses. Conta a partir da **última data da planilha**, não de hoje. |
| **Comparar por** | A categoria usada nas barras e na rosca |

**O que aparece:**

- **Cartões:** total, média, maior valor e registros. Para percentuais, o total vira "mínimo",
  porque somar percentuais não faz sentido.
- **Evolução:** a medida ao longo do tempo.
- **Barras:** as 8 maiores categorias; as demais somadas em **Outros**.
- **Rosca:** a participação de cada categoria, só quando somar faz sentido.

O endereço da página guarda o dataset aberto: dá para salvar nos favoritos.

## 7. Configurações

- **Aparência:** tema escuro ou claro (fica salvo neste navegador).
- **Conexão com a API:** mostra o endereço usado e se a API está respondendo. Útil quando algo
  não carrega.

## Telas "Em breve"

**Relatórios** (Sprint 5) e **Assistente IA** (Sprint 6) ainda não funcionam; a própria tela avisa.

## Problemas comuns

| Mensagem ou sintoma | O que fazer |
| --- | --- |
| "Não foi possível conectar à API" | A API está acordando: espere até 1 minuto e clique em **Tentar novamente**. Persistindo, veja **Configurações → Conexão com a API**. |
| "O arquivo excede o limite de 25 MB" | Compacte em `.zip` ou `.gz` e envie de novo |
| "Formato não suportado" | Use `.csv`, `.xlsx`, `.zip` ou `.gz` (para `.xls`: Salvar como `.xlsx`) |
| Valores aparecem como texto (alinhados à esquerda, sem R$) | Arquivos importados **antes de 23/11/2026** não tinham a conversão: importe de novo. Ou a coluna tem muitos valores que não são números. |
| Uma coluna de dinheiro aparece como "número" | No Excel, células **formatadas** como R$ perdem o símbolo. Renomeie a coluna incluindo "valor" ou "preço", ou digite os valores com `R$`. |
| O Dashboard diz que não tem o que mostrar | O dataset não tem nenhuma coluna de número, data ou categoria |
| Sumiu um dataset | Hoje **não há login**: qualquer pessoa com o link pode remover. Isso muda no Sprint 5. |
