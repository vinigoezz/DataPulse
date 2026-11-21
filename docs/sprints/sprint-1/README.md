# Sprint 1: Frontend com dados reais

**Objetivo:** as telas do site pararem de mostrar dados inventados e passarem a mostrar as
planilhas que você importou de verdade.

**Resultado:** você importa um CSV, ele aparece em **Meus Datasets**, e no **Explorador** dá para
buscar, filtrar, ordenar e paginar as linhas dele. Tudo vem da API.

## Os passos

| # | Passo | Em uma frase |
| --- | --- | --- |
| 1 | [Formatação do Frontend](01-formatacao.md) | Passamos um “corretor de formatação” em todo o código do site. |
| 2 | [Frontend em vertical slices](02-vertical-slices-frontend.md) | O site ganhou a mesma organização por funcionalidade do backend. |
| 3 | [Camada de dados](03-camada-de-dados.md) | Um único “atendente” busca os dados, da API ou da demonstração, e guarda uma cópia para não perguntar de novo. |
| 4 | [Tela Meus Datasets](04-tela-datasets.md) | Lista, detalhes e remoção funcionando de verdade. |
| 5 | [Explorador](05-explorador.md) | Busca, filtros, ordenação e páginas feitos pelo servidor. |
| 6 | [Importar](06-importar.md) | Aceita arquivos compactados, descrição, e leva direto ao Explorador. |
| 7 | [Carregando, erro e vazio](07-estados-das-telas.md) | Toda tela sabe o que mostrar enquanto espera, quando falha e quando não tem nada. |

## Uma mudança no plano

Busca, filtro e ordenação no servidor estavam previstos para o Sprint 3. Fizemos agora, porque sem
isso o Explorador **perderia** essas funções ao trocar os dados de demonstração pelos reais. E,
pela lógica de vertical slice, a funcionalidade “explorar” fica completa de ponta a ponta de uma vez.

## Pendências do Sprint 1

- **Conferir no navegador** (ver “Como testar você mesmo” abaixo). Os testes automáticos e a
  verificação pela linha de comando passaram, mas olhar as telas é com você.
- **Fazer o commit.**

## Como testar você mesmo

```bash
make dev
```

1. Abra o endereço do site que aparece no terminal (porta 8080).
2. Vá em **Importar**, envie um CSV e clique em **Concluir importação**.
3. Clique em **Explorar dados**: experimente buscar, clicar no nome de uma coluna para ordenar e,
   nas colunas de categoria, no ícone de funil para filtrar.
4. Volte em **Meus Datasets**: o arquivo está lá. Teste **Remover**.
5. Desligue a API (Ctrl+C) e recarregue o Explorador: a tela mostra o erro com um botão
   **Tentar novamente**, em vez de quebrar.
