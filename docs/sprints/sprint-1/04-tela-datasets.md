# Passo 4: Tela Meus Datasets com dados reais

## O que mudou para quem usa

| Antes | Agora |
| --- | --- |
| Lista fixa, inventada | Lista vinda da API: o que você importou de verdade |
| “Remover” só escondia da tela (voltava ao recarregar) | “Remover” apaga de verdade na API, com aviso claro de que não dá para desfazer |
| “Visualizar” só funcionava para um arquivo de exemplo | “Explorar dados” abre **qualquer** dataset processado no Explorador |
| Sem indicação de carregamento ou erro | Mostra carregando, erro com “Tentar novamente” e lista vazia com atalho para importar |

## Como funciona por dentro

1. `DatasetsPage` pede a lista com `useDatasets()` (passo 3).
2. A busca, o filtro de status e a ordem acontecem **no navegador**, com a regra de
   `filter-datasets.ts`. A lista de datasets é pequena (dezenas de itens), então não vale ir ao
   servidor a cada letra digitada. Isso é diferente das **linhas** de um dataset, que podem ser
   milhões e por isso são filtradas no servidor (passo 5).
3. Ao confirmar a remoção, `RemoveDatasetDialog` chama `useRemoveDataset()`. Quando a API confirma,
   aparece “removido” e a lista se atualiza sozinha.
4. “Explorar dados” leva para `/explorador?dataset=<id>`. O id fica **na URL**, então dá para
   salvar nos favoritos ou mandar o link para alguém.
5. “Explorar” fica desabilitado para datasets que não estão **processados**, porque não há linhas
   para mostrar.

## No modo demonstração

Continua funcionando com a lista inventada, e o texto do topo avisa “demonstração (API não
configurada)”. Remover vale até recarregar a página, e a janela de confirmação diz isso.

## Também ligados à lista real

- A **busca do cabeçalho** (Ctrl+K) lista os datasets reais e abre o escolhido no Explorador.
- O bloco **Atividade recente** da página inicial mostra os últimos datasets reais.
