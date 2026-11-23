# Passo 5: Sem dados de exemplo

## O problema

O site veio do Lovable com várias telas cheias de **dados inventados**: uma planilha de vendas de
mentira, uma pessoa fictícia logada, notificações que nunca aconteceram e relatórios de exemplo.
Com o site no ar, isso confunde: quem abre vê números bonitos que não têm nada a ver com os próprios
dados.

**Regra nova:** o site mostra **só o que é de verdade**. O que ainda não foi construído diz isso
claramente, em vez de fingir que funciona.

## O que mudou em cada tela

| Tela | Antes | Agora |
| --- | --- | --- |
| **Visão Geral** (início) | Faturamento, pedidos e gráficos de uma empresa fictícia | Números reais: quantos datasets, quantos registros, espaço usado e a última importação. Sem datasets, um convite para importar o primeiro. |
| **Dashboard** | Gráficos de vendas inventadas | Página "Em breve · Sprint 4", explicando o que vai ter e com atalho para o Explorador |
| **Relatórios** | Lista de relatórios de exemplo | Página "Em breve · Sprint 5" |
| **Assistente IA** | Já avisava que era "em breve" | Sem mudança |
| **Configurações** | Idioma, formatos, notificações e conta, todos marcados "Não implementado" | Só o que funciona: **tema** (claro/escuro) e um painel novo, **Conexão com a API**, que mostra se o site está conseguindo falar com a API |
| **Barra lateral e topo** | "Ana" (pessoa fictícia), menu de perfil e notificações inventadas | Removidos. Voltam com o login, no Sprint 5. |
| **Menu** | | Dashboard e Relatórios ganharam a etiqueta **Em breve**, como o Assistente |

## O modo demonstração também saiu

Até aqui, se o site não soubesse o endereço da API (`VITE_API_URL`), ele mostrava uma lista de
datasets inventada. Isso era útil no começo, mas tem um efeito ruim: se a configuração falhar, o
site **parece funcionar** com dados falsos, e ninguém percebe o problema. Foi exatamente o que
aconteceu no primeiro deploy na Vercel (passo 4).

Agora, sem a API, o site mostra um **erro claro** ("Endereço da API não configurado" ou "Não foi
possível conectar à API"), com o botão **Tentar novamente**. E o painel **Configurações → Conexão com
a API** mostra o endereço usado e a situação, o que ajuda a descobrir o problema.

**Consequência:** o preview dentro do Lovable, que não tem a nossa API, passa a mostrar esse erro
em vez de dados de exemplo. O site de verdade (Vercel) e o `make dev` funcionam normalmente.

## O que foi apagado do código

| Apagado | O que era |
| --- | --- |
| `src/mocks/` | As planilhas, o usuário e os relatórios inventados |
| `src/lib/analytics.ts` e o teste dele | Cálculos de faturamento feitos sobre a planilha inventada |
| `features/datasets/api/demo-datasets-api.ts` e `query-rows.ts` | O modo demonstração |
| `components/dashboard/` e `src/types/index.ts` | Cartões e tipos feitos para os dados de vendas inventados |

Os **gráficos** (`components/charts/`) foram guardados: são peças visuais prontas, sem dados, que o
Dashboard de verdade vai usar no Sprint 4.

## Como ficou organizado (vertical slice)

- `features/datasets/resumo/`: a fatia nova da página inicial. A conta dos números fica em
  `summarize.ts`, que tem testes (`summarize.test.ts`), e a tela só desenha.
- `features/configuracoes/`: a tela de Configurações, dividida em `AppearancePanel` (tema) e
  `ConnectionPanel` (conexão).
- `components/layout/PageHeader.tsx`: ganhou o `ComingSoon`, a tela padrão de "em breve", usada pelo
  Dashboard e pelos Relatórios.

## Verificação

- Testes, checagem de tipos e build passando.
- Todas as 8 páginas abrem, e nenhuma contém dados inventados (conferido no HTML de cada uma).
