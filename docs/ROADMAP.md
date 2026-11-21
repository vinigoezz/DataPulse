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
- [ ] Commitar o Sprint 0

## Sprint 1 — Frontend com dados reais

- [ ] Reorganizar o Frontend em `src/features/<feature>/` (as rotas viram “casca” fina)
- [ ] Formatar o Frontend com o Prettier (hoje o `make lint` acusa ~340 avisos de formatação)
- [ ] Trocar os mocks de `use-datasets.ts` pelo `datasetsService` + React Query
- [ ] Datasets: listar, ver detalhe e apagar pela API
- [ ] Explorador: linhas paginadas e estatísticas da API
- [ ] Estados de carregando, erro e vazio em todas as telas

**Entrega:** importar um CSV e vê-lo de verdade em Datasets e no Explorador.

## Sprint 2 — Supabase e primeiro deploy na Vercel

Feito cedo de propósito: os limites da Vercel aparecem agora, quando ainda é barato mudar.

- [ ] Projeto no Supabase: tabela `datasets` (metadados) e bucket de Storage (Parquet)
- [ ] Migrações em `supabase/` na raiz do repositório
- [ ] `SupabaseDatasetRepository` com os mesmos métodos do repositório em disco (escolha por variável de ambiente)
- [ ] Upload direto do navegador para o Supabase Storage (contorna o limite de ~4,5 MB da Vercel)
- [ ] Deploy da API na Vercel (conferir o tamanho do pacote com pandas + pyarrow)
- [ ] Deploy do Frontend na Vercel (alvo do Nitro = Vercel) com `VITE_API_URL` apontando para a API
- [ ] Segredos só nas variáveis de ambiente da Vercel, nunca no repositório

**Entrega:** o DataPulse acessível por uma URL pública, com os dados guardados no Supabase.

## Sprint 3 — Dados brasileiros e Explorador no servidor

- [ ] Ler `45,50` e `1.234,56` como número/moeda
- [ ] Filtro, busca e ordenação no servidor em `/rows`
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
