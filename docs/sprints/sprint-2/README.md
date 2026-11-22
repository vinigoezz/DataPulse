# Sprint 2: Arquitetura portátil, Supabase e primeiro deploy

**Objetivo:** colocar o DataPulse no ar, com os dados guardados no Supabase, **sem ficar preso**
ao Supabase nem à Vercel. Se um dia for preciso trocar de banco ou de hospedagem, a troca deve ser
mudar configurações, não reescrever o sistema.

## Os passos

| # | Passo | Em uma frase | Situação |
| --- | --- | --- | --- |
| 1 | [Arquitetura portátil](01-arquitetura-portatil.md) | O sistema ganhou "tomadas" para o banco e para os arquivos, e cada serviço vira só um endereço e uma senha. | Feito |
| 2 | [Conectar ao Supabase](02-conectar-supabase.md) | Preencher o `backend/.env` e criar as tabelas com `make migrar`. | Feito (trocar a senha do banco) |
| 3 | [Deploy da API](03-deploy-api.md) | Colocar a API no ar no Render. | Arquivos prontos; falta você cadastrar |
| 4 | [Deploy do site](04-deploy-site.md) | Colocar o site no ar na Vercel, apontando para a API. | Arquivos prontos; depois do passo 3 |

## Comandos novos

| Comando | O que faz |
| --- | --- |
| `make migrar` | Cria no banco as tabelas que faltam e o "balde" de arquivos. Pode rodar quantas vezes quiser. |
| `make servicos` | Liga um Postgres e um S3 **de mentira** no seu computador (Docker). |
| `make test-integracao` | Roda os testes também contra esse Postgres e esse S3. |
| `make servicos-parar` | Desliga os serviços do Docker. |
