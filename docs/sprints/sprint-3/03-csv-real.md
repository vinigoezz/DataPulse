# Passo 3: Teste com um CSV "de verdade"

## A ideia

Testes com dados inventados de propósito tendem a testar só o que já pensamos. Por isso criamos um
arquivo no formato **exato** que o Excel brasileiro gera ao "Salvar como CSV":

- codificação **latin-1** (a do Windows em português);
- separador **`;`**;
- quebras de linha do Windows;
- colunas com acentos no nome ("Preço unitário", "Avaliação");
- datas `dd/mm/aaaa`, valores `R$ 1.250,00`, percentuais `12,5%`, quantidade `1.200`;
- e as "armadilhas": código de produto `00123`, CEP `01310-100`, CPF `123.456.789-00`.

O arquivo fica em `backend/tests/fixtures/vendas_brasil.csv`, e o teste
(`test_csv_brasileiro.py`) importa ele pela API, como o site faria, e confere o tipo de cada coluna,
as estatísticas, as linhas e o filtro por faixa.

## O bug que ele achou

Na primeira execução, o teste falhou: a coluna **Código** (`00123`) virou **data**: o ano 123!

**Por quê:** quando nenhum formato de data conhecido serve, a API tenta um modo "adivinhe o
formato" do pandas, que aceita quase qualquer coisa, inclusive `00123` como ano. Esse bug **já
existia** antes deste sprint, só que nenhum teste tinha um código com zeros à esquerda.

**Correção:** texto só com dígitos (`00123`, `2026`) **nunca** é tratado como data. Datas de
verdade sempre têm separador (`/`, `-`, `.`). Ganhou um teste próprio, para não voltar.

Isso mostra o valor de testar com dados parecidos com os reais.
