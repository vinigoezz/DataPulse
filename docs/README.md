# Documentação do DataPulse

O DataPulse transforma planilhas (CSV e Excel) em tabelas pesquisáveis, estatísticas e gráficos.
Ele entende o formato brasileiro: `R$ 1.234,56`, `15%`, `05/01/2026`.

**No ar:** site https://data-pulse-gamma.vercel.app · API https://datapulse-api-uqj2.onrender.com/docs

## Por onde começar

| Você quer... | Leia |
| --- | --- |
| **Usar** o DataPulse: importar, explorar, montar gráficos | [Guia do usuário](GUIA-DO-USUARIO.md) |
| Entender **onde o sistema roda**, publicar mudanças, trocar senhas, resolver problemas | [Infraestrutura e operação](INFRAESTRUTURA.md) |
| **Programar** no projeto: instalar, rodar, testar, criar funcionalidades | [Guia de desenvolvimento](DESENVOLVIMENTO.md) |
| Ver a **organização do código** e o **contrato da API** (cada endereço e parâmetro) | [Arquitetura](ARQUITETURA.md) |
| Saber **o que já foi feito e o que falta** | [Roadmap](ROADMAP.md) |
| Entender **cada passo** de cada sprint, explicado para leigos | [`sprints/`](sprints/) |

## O DataPulse em 1 minuto

```
   Navegador ──► Site (Vercel) ──► API (Render) ──► Supabase
                  as telas        lê planilhas,     Postgres: ficha de cada dataset
                                  filtra, calcula   Storage: os dados das planilhas
```

- **Site** (`Frontend/`): React + TanStack Start, criado no Lovable. Só mostra as telas e conversa
  com a API.
- **API** (`backend/`): Python + FastAPI + pandas. Lê os arquivos, converte números e datas,
  guarda, filtra e calcula os totais do Dashboard.
- **Dados** (Supabase): um banco Postgres com a lista de datasets e um armazenamento de arquivos
  com os dados em formato Parquet.

O projeto não depende de nenhum fornecedor em particular. O banco é um Postgres comum, os
arquivos usam o padrão S3 e a API é um container Docker. Trocar de provedor é mudar
configurações, não reescrever código.

## Situação atual

| Pronto | Ainda não |
| --- | --- |
| Importar CSV, Excel (.xlsx), .zip e .gz | **Login**: hoje qualquer pessoa com o link vê e apaga tudo (Sprint 5) |
| Meus Datasets, Explorador e Dashboard | Relatórios salvos e exportação (Sprint 5) |
| Formato brasileiro de números, moeda, % e datas | Testes automáticos no GitHub (Sprint 5) |
| Site, API e dados no ar | Assistente com IA (Sprint 6, opcional) |
