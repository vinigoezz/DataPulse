# Infraestrutura e operação

Onde cada parte do DataPulse roda, como as mudanças chegam ao ar, onde ficam as senhas e o que
fazer quando algo dá errado. Todos os serviços estão hoje no **plano grátis**.

## O desenho

```
        Você / visitante (navegador)
           │                    │
   1. abre o site        2. pede os dados
           ▼                    ▼
   ┌──────────────┐     ┌──────────────────┐
   │   VERCEL     │     │     RENDER       │
   │   o site     │     │   a API (Python) │
   │  (telas)     │     │  caixa Docker    │
   └──────────────┘     └────────┬─────────┘
                                 │ 3. guarda e lê
                     ┌───────────┴───────────┐
                     ▼                       ▼
             ┌──────────────┐        ┌──────────────┐
             │  SUPABASE    │        │  SUPABASE    │
             │  Postgres    │        │  Storage     │
             │  (catálogo)  │        │  (planilhas) │
             └──────────────┘        └──────────────┘

   GITHUB (o código) ──git push──► Vercel e Render publicam sozinhos
```

## As peças

| Peça | Serviço | Endereço / identificação | Configuração no repositório |
| --- | --- | --- | --- |
| Site | **Vercel**, projeto `data-pulse` | https://data-pulse-gamma.vercel.app | `Frontend/vercel.json` |
| API | **Render**, serviço `datapulse-api` (Docker, região Ohio) | https://datapulse-api-uqj2.onrender.com | `render.yaml`, `backend/Dockerfile` |
| Catálogo | **Supabase Postgres**, projeto `ngdncripmhnkunjfevqw` (us-east-2) | conexão pelo *Session pooler* `aws-0-us-east-2.pooler.supabase.com:5432` | `backend/migrations/*.sql` |
| Arquivos | **Supabase Storage**, bucket privado `datapulse` (protocolo S3) | `https://ngdncripmhnkunjfevqw.storage.supabase.co/storage/v1/s3` | `render.yaml` |
| Código | **GitHub** `vinigoezz/DataPulse`, branch `main` | — | — |
| Editor visual | **Lovable**, ligado à pasta `Frontend/` pelo GitHub | — | `Frontend/AGENTS.md` |

### O que fica guardado onde

| Dado | Onde | Como |
| --- | --- | --- |
| Ficha de cada dataset (nome, data, linhas, colunas, descrição) | Postgres, tabela `datasets` | Uma linha por dataset |
| Atualizações já aplicadas ao banco | Postgres, tabela `schema_migrations` | Uma linha por arquivo de `backend/migrations/` |
| Dados das planilhas, já convertidos | Storage, `datasets/<id>/data.parquet` | Formato Parquet (cerca de 4x menor que o CSV) |

As duas tabelas têm **RLS ligado sem nenhuma permissão**: ninguém de fora acessa, nem com a chave
pública do Supabase. Só a API, que entra como dona do banco. O bucket é **privado**: abrir um
arquivo pelo link público é recusado.

## O caminho de um pedido

Exemplo: abrir o Explorador.

1. O navegador baixa as telas da **Vercel**.
2. A tela pede as linhas à **API** (Render). Se ela estiver dormindo, leva cerca de 1 minuto para
   acordar.
3. A API consulta o catálogo no **Postgres**, baixa o Parquet do **Storage**, filtra e responde.
4. A API guarda na memória as **4 últimas planilhas** abertas: os próximos pedidos não vão ao
   Storage.

A API só aceita pedidos de endereços autorizados (CORS): `localhost` em desenvolvimento e
endereços da Vercel que começam com `datapulse` ou `data-pulse`
(`DATAPULSE_CORS_ORIGIN_REGEX`).

## Como uma mudança vai para o ar

```
git push (branch main)
   ├─► Vercel: monta e publica o site (1 a 3 min) — a cada push
   ├─► Render: remonta a API (2 a 5 min) — só se algo mudou em backend/
   │      └─ ao ligar: python -m app.preparar (aplica migrações novas, garante o bucket)
   └─► Lovable: recebe o código novo de Frontend/
```

- **Mudança no banco:** crie um arquivo novo em `backend/migrations/` (`0002_...sql`, nunca edite
  um que já rodou). Ele é aplicado sozinho quando a API liga, ou na hora com `make migrar`.
- **Variável nova no site** (`VITE_*`): cadastre na Vercel com visibilidade **Config** (nunca
  "secret": vai para dentro do código do site) e faça **Redeploy**. Ela é gravada no site na
  hora do build.
- **Variável nova na API:** cadastre no painel do Render (**Environment**) ou, se for segredo,
  inclua em `SEGREDOS` em `backend/scripts/render_segredos.py`.

## Configurações e segredos

### API (`backend/.env` no seu computador, painel do Render em produção)

| Variável | Segredo? | O que é |
| --- | --- | --- |
| `DATAPULSE_DATABASE_URL` | **Sim** | Endereço do Postgres com senha. Vazio = arquivos locais. |
| `DATAPULSE_S3_ACCESS_KEY` / `DATAPULSE_S3_SECRET_KEY` | **Sim** | Chaves do Storage |
| `DATAPULSE_S3_BUCKET` / `_ENDPOINT` / `_REGION` | Não | Bucket `datapulse`, endpoint do Supabase, `us-east-2`. Sem bucket = pasta local. |
| `DATAPULSE_CORS_ORIGINS` / `DATAPULSE_CORS_ORIGIN_REGEX` | Não | Quem pode chamar a API |
| `DATAPULSE_MAX_UPLOAD_MB` | Não | Limite por arquivo (25 no Render; 200 por padrão) |
| `DATAPULSE_STORAGE_DIR` | Não | Pasta usada quando banco/S3 não estão configurados |
| `RENDER_API_KEY` / `RENDER_SERVICE_ID` | **Sim** / não | Só para `make render-segredos`; não vão para o servidor |

Modelo sem senhas: `backend/.env.example`.

### Site (`Frontend/.env.local`, painel da Vercel)

| Variável | O que é |
| --- | --- |
| `VITE_API_URL` | Endereço da API, sem `/` no final. **Público** (fica dentro do código do site). |

### Regras

- Senhas **nunca** vão para o GitHub nem para a Vercel. `backend/.env` e `Frontend/.env.local`
  são ignorados pelo Git.
- O `backend/.env` é a **única fonte da verdade**. Mudou uma senha? Atualize o arquivo e rode:

  ```
  make render-segredos
  ```

  Ele **testa** o banco e as chaves e só então envia ao Render, já iniciando um deploy novo. Se a
  senha estiver errada, para e explica, sem enviar nada.

## Tarefas do dia a dia

| Tarefa | Como |
| --- | --- |
| Trocar a senha do banco | Supabase → Project Settings → Database → Reset password → atualizar `backend/.env` → `make migrar` (tem que dizer "em dia") → `make render-segredos` |
| Trocar as chaves do Storage | Supabase → Storage → S3 → New access key → `backend/.env` → `make render-segredos` |
| Ver se a API está no ar | Abrir https://datapulse-api-uqj2.onrender.com/api/health → `{"status":"ok"}` |
| Ver os registros (logs) da API | Painel do Render → `datapulse-api` → **Logs** |
| Refazer o deploy da API | Painel do Render → **Manual Deploy**, ou `make render-segredos` |
| Refazer o deploy do site | Vercel → **Deployments** → ⋯ → **Redeploy** (sem cache de build) |
| Ver os dados guardados | Supabase → **Table Editor** → `datasets`; **Storage** → `datapulse` |
| Documentação interativa da API | https://datapulse-api-uqj2.onrender.com/docs |

## Limites do plano grátis

| Serviço | Limite | Efeito |
| --- | --- | --- |
| Render | 0,1 CPU e 512 MB de memória | Importações grandes são lentas; limite de 25 MB por arquivo |
| Render | Dorme após 15 min sem uso | A primeira visita leva cerca de 1 minuto |
| Render | 750 horas/mês | Suficiente para uma API ligada o mês inteiro |
| Supabase | Projeto pausa após cerca de 1 semana sem uso | Reativar no painel do Supabase |
| Supabase | 500 MB de banco, 1 GB de Storage (valores do plano grátis; confira no painel) | Muito acima do uso atual |
| Vercel | Plano Hobby | Sem limite relevante para o site atual |

Planos pagos resolvem esses limites. O Render a partir de cerca de US$ 7/mês acaba com o "dormir".

## Pontos de atenção

1. **Sem login:** qualquer pessoa com o link vê e apaga todos os datasets. Não divulgue o site
   antes do Sprint 5.
2. **Desenvolvimento e produção usam o mesmo banco:** o `backend/.env` aponta para o Supabase de
   verdade. Importar ou apagar algo com `make dev` afeta o site no ar. Os testes automáticos
   **não** tocam no Supabase. Para separar: crie um segundo projeto no Supabase para
   desenvolvimento, ou deixe vazias, no `backend/.env`, as linhas `DATAPULSE_DATABASE_URL` e
   `DATAPULSE_S3_BUCKET` (aí tudo fica em `backend/storage/`).
3. **Sem backup configurado:** se precisar, use os backups do Supabase (dependem do plano) ou
   exporte periodicamente.
4. **Sem testes automáticos no GitHub** (entra no Sprint 5).

## Como trocar de fornecedor

| Trocar | Faça |
| --- | --- |
| Banco (Supabase → Neon, AWS RDS, servidor próprio) | Mudar `DATAPULSE_DATABASE_URL` e rodar `make migrar` |
| Arquivos (Supabase Storage → AWS S3, Cloudflare R2, MinIO) | Mudar as variáveis `DATAPULSE_S3_*` |
| API (Render → Railway, Fly.io, Cloud Run, servidor) | Usar o mesmo `backend/Dockerfile`; cadastrar as variáveis |
| Site (Vercel → Netlify, Cloudflare...) | Definir `NITRO_PRESET` no build e `VITE_API_URL` |

Nenhuma dessas trocas exige mudar código. Detalhes em
[sprints/sprint-2/01-arquitetura-portatil.md](sprints/sprint-2/01-arquitetura-portatil.md).

## Problemas conhecidos e soluções

| Sintoma | Causa | Solução |
| --- | --- | --- |
| Deploy do Render falha com `database "postgres..." does not exist` | Mais de uma linha colada em `DATAPULSE_DATABASE_URL` | `make render-segredos` (não copiar e colar à mão) |
| `password authentication failed` | Senha do banco desatualizada | Atualizar `backend/.env`, conferir com `make migrar`, depois `make render-segredos` |
| `failed to resolve host 'postgres.xxx'` | Endereço do banco cortado (faltando `@servidor:5432/postgres`) | Copiar a URI inteira do Supabase (Connect → Session pooler) |
| Site mostra erro de conexão logo após o deploy | `VITE_API_URL` não existia na hora do build | Cadastrar na Vercel e fazer **Redeploy** |
| Vercel recusa `VITE_API_URL` com "visibility: secret" | Variáveis `VITE_` são públicas | Escolher visibilidade **Config** |
| Erro de CORS no console do navegador | O endereço do site não segue o padrão `datapulse...`/`data-pulse...vercel.app` | Ajustar `DATAPULSE_CORS_ORIGIN_REGEX` no Render |
| "Não foi possível conectar à API" na primeira visita | A API estava dormindo | Esperar cerca de 1 minuto |
