# Passo 6: Tela Importar

A tela já enviava o arquivo para a API. Neste sprint ela foi dividida em partes menores e ganhou
melhorias.

## O que mudou para quem usa

| Antes | Agora |
| --- | --- |
| Só aceitava `.csv` | Aceita `.csv`, `.zip` e `.gz`, os mesmos formatos que a API já aceitava |
| Sem descrição | Campo **Descrição (opcional)**, que aparece nos detalhes e nos cartões do dataset |
| Depois de importar: “Ver datasets” | Depois de importar: **Explorar dados**, que abre o arquivo recém-importado no Explorador |
| Arquivos acima de 200 MB só geravam um aviso | São recusados na hora, com a dica de compactar |
| A lista de datasets podia ficar desatualizada | A lista se atualiza sozinha após importar (passo 3) |

## Por que aceitar arquivos compactados importa

No Codespaces (e na Vercel, no Sprint 2) há limite de tamanho para cada envio. Um CSV costuma
encolher 5 a 10 vezes quando compactado, então compactar é o jeito mais simples de enviar arquivos
grandes. A API descompacta sozinha.

**Limitação:** o navegador não consegue mostrar a prévia de um arquivo compactado sem
descompactá-lo inteiro. Para `.zip`/`.gz`, a tela mostra o nome e o tamanho e avisa que a API vai
validar o conteúdo.

## Como a tela foi dividida

| Arquivo | Papel |
| --- | --- |
| `ImportPage.tsx` | O maestro: controla em que etapa estamos e chama o envio. |
| `ImportSteps.tsx` | A barra com as 4 etapas. |
| `DropZone.tsx` | A área de “arraste seu arquivo”. |
| `PreviewPanel.tsx` | O resumo do arquivo, os avisos e a prévia das primeiras linhas. |
| `ImportResult.tsx` | A mensagem final (sucesso, ou aviso de demonstração). |
| `preview.ts` | As regras: que formato é, se pode ser aceito, ler as primeiras linhas, quais avisos dar. Tem testes. |

## Um cuidado de clean code: etapas que não se contradizem

Antes, a tela guardava “em que etapa estou”, “qual arquivo”, “qual prévia” e “qual resultado” em
caixinhas separadas, que podiam ficar contraditórias (por exemplo, “etapa 3” sem nenhum arquivo).
Agora existe uma variável só, `stage`, e cada etapa carrega exatamente o que precisa: a etapa
“prévia” sempre tem um arquivo, e a etapa “concluído” sempre tem o resultado. O TypeScript impede
que alguém escreva uma combinação impossível.
