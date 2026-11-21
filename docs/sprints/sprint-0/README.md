# Sprint 0 — Arrumação

**Objetivo:** deixar a casa em ordem antes de construir coisas novas. Nenhuma funcionalidade nova
para o usuário final, mas tudo o que vem depois fica mais fácil, mais seguro e mais rápido de fazer.

## Os passos

| # | Passo | Em uma frase |
| --- | --- | --- |
| 1 | [Arrumação de arquivos](01-arrumacao.md) | Consertamos um documento, escolhemos uma ferramenta de instalação e achamos uma pasta do Frontend que estava sumida. |
| 2 | [Backend em vertical slices](02-vertical-slices-backend.md) | Reorganizamos o código da API por funcionalidade, como gavetas com tudo de um assunto. |
| 3 | [Qualidade do código](03-qualidade-do-codigo.md) | Pequenas melhorias de legibilidade, um corretor automático e testes por funcionalidade. |
| 4 | [Comando único](04-comando-unico.md) | Agora `make dev` liga o sistema inteiro. |
| 5 | [Plano com Vercel e Supabase](05-roadmap-vercel-supabase.md) | Ajustamos o plano das próximas sprints para onde o sistema vai morar. |

## Pendências do Sprint 0

- ~~Recuperar a pasta `Frontend/src/lib/` do Lovable~~ ✅ feito: os 7 arquivos foram trazidos e o
  Frontend voltou a compilar (ver passo 1.3).
- **Fazer o commit** (salvar oficialmente as mudanças no histórico do git).

## Glossário rápido

| Termo | O que significa |
| --- | --- |
| **Frontend** | A parte que você vê e clica no navegador: telas, botões, gráficos. |
| **Backend / API** | O “cozinheiro” que fica no servidor: recebe pedidos do Frontend, faz o trabalho pesado e devolve a resposta. |
| **Endpoint / rota** | Um “guichê” específico da API, como `GET /api/datasets` (“me dê a lista de datasets”). |
| **Dataset** | Uma planilha importada pelo usuário. |
| **git / commit** | O git guarda o histórico do projeto; um commit é uma “foto” salva desse histórico. |
| **Teste automatizado** | Um pequeno programa que usa o sistema e confere se a resposta está certa. |
| **Vercel** | Empresa que hospeda o site e a API na internet. |
| **Supabase** | Empresa que oferece banco de dados, armazenamento de arquivos e login prontos. |
