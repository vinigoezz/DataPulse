# Passo extra: Importar planilhas Excel (.xlsx)

## O problema

O DataPulse só aceitava **CSV**. Quem tinha a planilha em Excel precisava salvá-la como CSV antes,
e o `.xlsx` era recusado logo na tela de importação.

## Agora

A tela **Importar** aceita `.xlsx`. A API:

1. lê a **primeira aba** (as outras são ignoradas);
2. descarta linhas e colunas **totalmente em branco**;
3. respeita o tipo de cada célula: números e datas do Excel já chegam como número e data;
4. passa os **textos** pelas mesmas regras do CSV: `"R$ 1.250,00"`, `"12,5%"` e `"05/01/2026"`
   digitados como texto também são reconhecidos;
5. mantém como texto um código digitado como texto (`00123`), sem transformá-lo em 123.

Planilhas Excel **não têm prévia** no navegador (o navegador não lê `.xlsx` sem uma biblioteca
pesada). A tela avisa isso, e a API valida o arquivo ao importar.

## Limitações

| Situação | O que acontece |
| --- | --- |
| Arquivo `.xls` (Excel antigo, antes de 2007) | É recusado, com a dica de abrir no Excel e usar **Salvar como → .xlsx** |
| Célula com número **formatado** como R$ ou % | O Excel guarda só o número; o formato se perde. A coluna vira "número", a não ser que o nome indique dinheiro ("valor", "receita", "preço"...). Valores **digitados** com R$ ou % são reconhecidos normalmente. |
| Várias abas | Só a primeira é importada. Para outra aba, mova-a para a primeira posição antes de enviar. |
| Arquivo protegido por senha | É recusado com uma mensagem de erro. |

## Por dentro

- A leitura usa a biblioteca **calamine**, escrita em Rust: com 100 mil linhas, levou **1 s**,
  contra **8 s** da biblioteca tradicional (openpyxl). Isso faz diferença no plano grátis do
  Render, que tem pouca CPU.
- Durante os testes, as duas bibliotecas transformavam o código `"00447"` (texto) em 447. A
  correção foi ler cada célula "como ela é" (`dtype=object`) e só depois deixar o pandas
  deduzir o tipo de cada coluna.
- Código novo:
  - `importar/leitura_excel.py`: a leitura do Excel;
  - `importar/leitura.py`: escolhe CSV ou Excel pela extensão;
  - `importar/tipos.py`: o tratamento de números e datas, agora comum aos dois formatos.
- **Testes:** `backend/tests/features/datasets/test_excel.py` monta uma planilha célula por
  célula, com número, data, texto com R$, código com zeros, linha e coluna em branco e uma
  segunda aba.
