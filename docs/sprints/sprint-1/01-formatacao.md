# Passo 1: Formatação do Frontend

## O problema

O `make lint` acusava cerca de 340 problemas no Frontend. Quase todos eram de **formatação**:
espaços, quebras de linha, vírgulas no fim de listas. Não quebravam nada, mas:

- escondiam os avisos que importam no meio de centenas que não importam;
- cada pessoa (ou ferramenta, como o Lovable) formata de um jeito, e as mudanças ficam poluídas
  com “arrumações” misturadas com alterações de verdade.

## O que é o Prettier

O **Prettier** é um formatador automático. Ele reescreve o código sempre do mesmo jeito, como um
corretor que padroniza margens e espaçamento de um texto sem mudar o que está escrito. As regras do
projeto ficam em `Frontend/.prettierrc` (linhas de até 100 caracteres, aspas duplas, etc.).

## O que fizemos

1. Rodamos o Prettier em todo o Frontend (`bun run format`).
2. Conferimos: o `make lint` passou de ~340 **erros** para **0 erros**.

Restam 11 **avisos**, todos em componentes visuais que vieram prontos do Lovable (botões, menus).
Eles dizem que um arquivo exporta “componente + outra coisa”, o que só afeta o recarregamento
automático durante o desenvolvimento. Não vale mexer em código que o Lovable mantém por isso.

## Importante saber

- Formatar **não muda o comportamento**. Os testes e o build continuaram passando.
- Muitos arquivos aparecem como “alterados” por causa disso. Nas próximas mudanças, as diferenças
  serão só do que mudou de verdade.
