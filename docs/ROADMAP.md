# Roadmap do DataPulse

Hospedagem: **Vercel** (Frontend + API) e **Supabase** (banco, arquivos e login).
Organização do código: **vertical slices** e **clean code** (ver `docs/ARQUITETURA.md`).
Cada passo concluído tem uma explicação em linguagem simples em `docs/sprints/`.

## Sprint 0 — Arrumação

- [x] Corrigir o `docs/ARQUITETURA.md` (frase cortada no fim)
- [x] Padronizar o Frontend no bun e ignorar `package-lock.json`
- [x] Backend reorganizado em vertical slices, com testes por fatia
- [x] Ferramenta de qualidade no backend (ruff) e configuração em `backend/pyproject.toml`
- [x] Comando único para instalar, rodar, testar e conferir o código (`Makefile`)
- [x] Corrigir o `.gitignore` que escondia `Frontend/src/lib/`
- [x] Recuperar `Frontend/src/lib/` do Lovable (7 arquivos; testes, checagem de tipos e build passando)
- [x] Commitar o Sprint 0

## Sprint 1 — Frontend com dados reais

- [x] Frontend formatado com o Prettier (`make lint` sem erros; restam 11 avisos antigos nos componentes do Lovable)
- [x] Frontend reorganizado em `src/features/datasets/{listar,importar,explorar}` (rotas viram casca fina)
- [x] Camada de dados: `datasetsApi` + React Query (o modo demonstração foi removido no fim do Sprint 2)
- [x] Datasets: listar, ver detalhe, apagar e abrir no Explorador pela API
- [x] Explorador: linhas paginadas e estatísticas da API, com escolha de dataset pela URL
- [x] Busca, filtro e ordenação **no servidor** (adiantado do Sprint 3: é a mesma fatia)
- [x] Importar: aceita `.zip`/`.gz`, descrição opcional, atualiza a lista e leva ao Explorador
- [x] Estados de carregando, erro (com “tentar novamente”) e vazio nas três telas
- [x] Testes: 26 na API, 21 no Frontend
- [ ] Conferir as telas no navegador (`make dev`)
- [ ] Commitar o Sprint 1

**Entrega:** importar um CSV e vê-lo de verdade em Datasets e no Explorador.

## Sprint 2 — Arquitetura portátil, Supabase e primeiro deploy

Feito cedo de propósito: os limites da hospedagem aparecem agora, quando ainda é barato mudar.
Regra do sprint: **nenhum código depende de um provedor específico** (ver `docs/sprints/sprint-2/`).

- [x] Catálogo de datasets trocável: JSON local ou **Postgres** por `DATAPULSE_DATABASE_URL`
- [x] Arquivos trocáveis: pasta local ou **S3** (Supabase Storage, AWS, R2...) por `DATAPULSE_S3_*`
- [x] Migrações em SQL puro em `backend/migrations/` e comando `make migrar`
- [x] Testes de contrato: as peças locais e as de nuvem passam nos mesmos testes (`make test-integracao`)
- [x] `docker-compose.yml` com Postgres e S3 locais para testar sem internet
- [x] API em container (`backend/Dockerfile`), roda em qualquer hospedagem
- [x] Build do Frontend com alvo escolhido pela hospedagem (Vercel detectado sozinho; `NITRO_PRESET` nos outros)
- [x] Commitar os passos 1 e 2
- [x] Preencher `backend/.env` com o banco e as chaves S3 do Supabase e rodar `make migrar`
- [x] Preparar o deploy: `render.yaml`, migrações ao iniciar o container, CORS para as prévias da Vercel, `Frontend/vercel.json`
- [x] Deploy da API no Render (container, plano grátis): https://datapulse-api-uqj2.onrender.com
- [x] Deploy do Frontend na Vercel com `VITE_API_URL` apontando para a API: https://data-pulse-gamma.vercel.app
- [ ] ~~Upload direto do navegador para o Storage~~: desnecessário com a API no Render (sem limite de 4,5 MB)
- [x] Segredos só nas variáveis de ambiente das hospedagens, nunca no repositório (`make render-segredos`)

- [x] Sem dados de exemplo: Visão Geral com números reais; Dashboard e Relatórios marcados "Em breve"; usuário e notificações fictícios removidos

**Entrega:** o DataPulse acessível por uma URL pública, com os dados guardados no Supabase. ✅ Concluído em 23/11/2026.

## Sprint 3 — Dados brasileiros e Explorador no servidor

- [ ] Ler `45,50` e `1.234,56` como número/moeda
- [x] Filtro, busca e ordenação no servidor em `/rows` (adiantado para o Sprint 1)
- [ ] Busca e filtros rápidos em arquivos grandes (medir; índices ou DuckDB se preciso)
- [ ] Testes com CSVs reais (latin-1, `;`, dd/mm/aaaa)

**Entrega:** Explorador rápido com arquivos grandes e colunas numéricas reconhecidas.

## Sprint 4 — Dashboard real

- [ ] Fatias de agregação na API: KPIs, série mensal, agrupamentos (hoje em `src/lib/analytics.ts`)
- [ ] Dashboard com escolha de dataset, colunas e período
- [ ] Aposentar o protótipo Streamlit (`app.py`)

**Entrega:** dashboard de qualquer dataset importado.

## Sprint 5 — Contas de usuário e relatórios

- [ ] Login com Supabase Auth; cada dataset pertence a um usuário (Row Level Security)
- [ ] A API valida o token do Supabase em toda requisição
- [ ] Configurações com os dados do usuário real
- [ ] Relatórios salvos; exportação CSV/PDF
- [ ] CI no GitHub: `make lint` e `make test` em todo push

**Entrega:** vários usuários, cada um vendo só os próprios dados.

## Sprint 6 (opcional) — Data Pulse AI

- [ ] Tela Assistente: perguntas em linguagem natural sobre um dataset
