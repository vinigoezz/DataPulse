# Passo 7: Carregando, erro e vazio

Quando os dados vêm de outro computador (a API), eles **demoram** um pouco, **podem falhar** e
**podem não existir**. Uma tela bem feita sabe o que mostrar em cada caso, em vez de ficar em
branco, travar ou mostrar uma mensagem técnica.

## Os quatro estados

| Estado | O que a pessoa vê | Onde |
| --- | --- | --- |
| **Carregando** | Blocos cinzas no formato do conteúdo (*skeleton*), que dão a sensação de rapidez | Datasets, Explorador (página e tabela), cartões de estatística |
| **Erro** | Ícone de alerta, a mensagem do problema em português e o botão **Tentar novamente** | Datasets, Explorador |
| **Vazio** | Explicação e o próximo passo: “Importar dataset”, “Limpar filtros”, “Ver meus datasets” | Datasets (sem nada / filtro sem resultado), Explorador (sem dataset / busca sem resultado / dataset inexistente) |
| **Atualizando** | Os dados antigos continuam na tela e aparece “atualizando…” ao lado do contador | Explorador, ao trocar de página ou filtrar |

## A peça nova: `ErrorState`

Já existia um `EmptyState` (para “vazio”). Criamos um irmão, o `ErrorState`, em
`src/components/layout/PageHeader.tsx`. Ele mostra qualquer erro do mesmo jeito em todas as telas,
então os futuros Dashboard e Relatórios já podem usar.

## Por que “Tentar novamente” e não só “recarregue a página”

Recarregar a página joga fora o que você tinha feito (filtros, busca, página). O botão pede de novo
**só o que falhou**. Se a API tinha caído por um instante, tudo volta como estava.

## Erros de ações (remover, importar)

Para ações, o erro aparece como uma **notificação** no canto da tela (ex.: “Não foi possível
remover: Dataset não encontrado”), porque a pessoa continua na mesma tela e pode tentar de novo.
