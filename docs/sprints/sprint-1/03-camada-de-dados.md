# Passo 3: Camada de dados (de onde as telas tiram as informações)

## Duas fontes de dados, uma porta só

O site pode funcionar de dois jeitos:

- **Com API** (`VITE_API_URL` definido em `Frontend/.env.local`): os dados vêm do backend.
- **Demonstração** (sem `VITE_API_URL`): dados inventados, úteis no preview do Lovable, que não
  tem acesso à nossa API.

Antes, cada tela decidia por conta própria de onde buscar, e algumas só sabiam usar os dados
inventados. Agora existe **uma porta só**, o `datasetsApi`. As telas pedem “me dê a lista” e não
sabem (nem precisam saber) se a resposta veio da API ou da demonstração.

```
features/datasets/api/
├── datasets-api.ts       ← o “contrato” da porta: lista, detalhe, remover, linhas, estatísticas, enviar
├── http-datasets-api.ts  ← implementação que conversa com a API pela internet
├── demo-datasets-api.ts  ← implementação com dados inventados
├── query-rows.ts         ← busca/filtro/ordem da demonstração, com as MESMAS regras do backend
└── index.ts              ← escolhe uma das duas conforme o VITE_API_URL
```

É como uma tomada: o aparelho (a tela) só conhece o formato da tomada. Se a energia vem da rua ou
de um gerador, tanto faz.

**Detalhe importante:** a demonstração imita a API **inclusive nas regras** (busca sem diferenciar
maiúsculas, vazios no fim da ordenação...). Os testes do Frontend (`query-rows.test.ts`) usam os
mesmos cenários dos testes do backend (`test_linhas.py`), para garantir que os dois se comportem igual.

## React Query: a memória dos dados

O **React Query** é uma biblioteca que fica entre as telas e a porta de dados. Ela:

1. **Guarda o que já foi buscado.** Se você sai de Meus Datasets e volta, a lista aparece na hora.
2. **Evita pedidos repetidos.** O cabeçalho e a tela pedem a mesma lista? Vai um pedido só.
3. **Atualiza quando algo muda.** Depois de remover ou importar um dataset, ela “esquece” a lista
   antiga e busca de novo sozinha. Isso se chama **invalidar o cache**.
4. **Informa o estado:** carregando, deu erro, chegou. As telas usam isso para mostrar o que é
   certo (passo 7).

Tudo isso fica em `features/datasets/queries.ts`, com nomes que dizem o que fazem:

| Hook | O que a tela recebe |
| --- | --- |
| `useDatasets()` | A lista de datasets |
| `useDataset(id)` | Um dataset |
| `useDatasetRows(id, consulta)` | Uma página de linhas (mantendo a página anterior na tela enquanto a próxima chega, sem “piscar”) |
| `useDatasetStats(id)` | Estatísticas das colunas |
| `useRemoveDataset()` | Uma função para remover (e atualizar a lista depois) |
| `useUploadDataset()` | Uma função para enviar arquivo (e atualizar a lista depois) |

## Mensagens de erro melhores

O `src/lib/http.ts` agora diferencia dois problemas:

- **A API respondeu com erro:** mostra a mensagem da própria API (ex.: “Dataset não encontrado”).
- **A API nem respondeu** (desligada, endereço errado): mostra “Não foi possível conectar à API.
  Verifique se ela está rodando.” Antes aparecia um “Failed to fetch” sem explicação.
