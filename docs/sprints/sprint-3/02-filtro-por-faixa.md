# Passo 2: Filtro por faixa

## O que é

Até aqui, o Explorador só filtrava por **valor exato** (filial = Recife). Agora dá para filtrar por
**faixa**: "receita entre R$ 100 e R$ 500", "desconto a partir de 10%", "vendas até 31/03/2026".
Um dos lados pode ficar em branco.

## Como usar

1. No Explorador, colunas de número, moeda, percentual e data têm um ícone de filtro ao lado do nome.
2. Preencha **mínimo** e/ou **máximo** e clique em **Aplicar** (ou tecle Enter).
   - Números podem ser digitados como `1.234,56` ou `1234.56`.
   - Percentuais são digitados como aparecem na tela: `15` quer dizer 15%.
   - Datas usam o seletor de data do navegador.
3. Aparece uma etiqueta acima da tabela, ex.: **Total: R$ 100,00 a R$ 500,00**. Clique nela para
   remover. Faixas, filtros e busca funcionam juntos.

## Detalhes que evitam surpresas

- **"Até 31/01" inclui o dia 31 inteiro**, mesmo que a data tenha hora (31/01 às 18h entra).
- **Vazios nunca entram** numa faixa: uma linha sem valor não está "entre 100 e 500".
- Se o limite não fizer sentido (texto numa faixa de números, ou faixa numa coluna de texto), a API
  responde com uma mensagem clara, em vez de quebrar.

## Por dentro

- API: novo parâmetro `ranges` em `GET /api/datasets/{id}/rows`, no formato
  `{"Total": {"min": 100, "max": 500}}`. A ordem é: filtros → faixas → busca → ordenação → página.
  Fica em `backend/app/features/datasets/linhas/consulta.py`, com 9 testes novos.
- Site: `explorar/RangeMenu.tsx` (a janelinha com os dois campos) e `explorar/range-input.ts` (a
  conversão do que você digita para o que a API entende, e a frase da etiqueta), com 6 testes.
