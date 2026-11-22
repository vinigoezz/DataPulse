# Passo 1: Arquitetura portátil

## O problema

Até o Sprint 1, a API guardava tudo numa pasta do computador (`backend/storage/`). Isso não serve
na nuvem: as hospedagens modernas apagam essa pasta a cada reinício. Precisávamos guardar os dados
num banco de dados e num serviço de arquivos, no caso o Supabase.

O jeito mais rápido seria usar as ferramentas próprias do Supabase por todo o código. Funciona, mas
cria **dependência**: se o Supabase ficar caro, mudar de regras ou sair do ar, seria preciso
reescrever metade do sistema. Escolhemos o caminho que deixa a porta aberta.

## A ideia: tomadas

Pense na tomada da sua casa. A geladeira não sabe se a energia vem da hidrelétrica, do painel solar
ou de um gerador. Ela só conhece o **formato da tomada**.

Fizemos o mesmo com as duas coisas que a API precisa guardar:

| O que guardar | A "tomada" (contrato) | O que pode ser ligado nela |
| --- | --- | --- |
| **Catálogo**: nome, data, linhas e colunas de cada dataset | `features/datasets/catalogo/porta.py` | Arquivos JSON numa pasta (para testes) **ou** qualquer banco **Postgres** (Supabase, Neon, AWS...) |
| **Arquivos**: os dados das planilhas, em formato Parquet | `shared/arquivos/porta.py` | Uma pasta do computador **ou** qualquer serviço **S3** (Supabase Storage, AWS S3, Cloudflare R2...) |

As telas e as funcionalidades (importar, listar, explorar...) **não mudaram nada**. Elas continuam
pedindo "guarde este dataset" e "me dê aquele", sem saber onde as coisas ficam.

## Por que Postgres e S3, e não "Supabase"

**Postgres** e **S3** são **padrões**, como a tomada de três pinos. Dezenas de empresas oferecem
serviços compatíveis com eles. O Supabase é uma delas: por baixo, o banco do Supabase é um
Postgres comum, e o Storage dele aceita o protocolo S3.

Então o código fala "Postgres" e "S3", nunca "Supabase". Para mudar de provedor:

- **Banco:** trocar a linha `DATAPULSE_DATABASE_URL` e rodar `make migrar`. Pronto.
- **Arquivos:** trocar as 5 linhas `DATAPULSE_S3_*`.

## Quem escolhe qual peça usar? As configurações

Tudo é decidido por **variáveis de ambiente**: um bloco de "nome = valor" fora do código.

- No seu computador, elas ficam em `backend/.env`. Esse arquivo **não vai para o GitHub**, porque
  tem senhas. O modelo, sem senhas, é `backend/.env.example`.
- Na hospedagem, são cadastradas no painel do serviço.

Se a variável do banco estiver vazia, a API usa a pasta local, como antes. Por isso o
desenvolvimento e os testes continuam funcionando **sem internet** e sem conta em lugar nenhum.

## Migrações: a planta do banco

Um banco novo vem vazio, sem tabelas. As **migrações** são as instruções para montá-lo, como a
planta de uma casa. Ficam em `backend/migrations/`, numeradas:

```
backend/migrations/
└── 0001_criar_datasets.sql   ← cria a tabela "datasets"
```

O comando `make migrar` lê essa pasta, vê quais instruções o banco ainda não recebeu (ele anota
isso numa tabelinha chamada `schema_migrations`) e aplica só as novas. Se uma der errado, nenhuma
entra pela metade. Quando precisarmos mudar o banco no futuro, criamos um `0002_...sql`. Nunca
editamos um arquivo que já rodou.

São instruções em **SQL puro**, a língua de qualquer Postgres. Por isso não usamos a ferramenta
de migrações do Supabase.

### Um cuidado de segurança

O Supabase deixa o banco acessível pela internet com uma "chave pública" (a `anon key`). Para que
ninguém leia ou apague os dados com essa chave, a migração liga a **segurança por linha (RLS)**
sem nenhuma permissão: só a nossa API, que entra com o usuário dono do banco, consegue mexer na
tabela. Isso também é Postgres padrão.

## Testes de contrato: a garantia de que dá para trocar

De nada adianta ter tomadas se os aparelhos se comportam diferente em cada uma. Por isso cada
tomada tem uma **lista de testes de contrato**, e **todas** as peças precisam passar nela:

- "guardar e ler devolve os mesmos bytes", "apagar algo que não existe não dá erro"...
- "a lista vem do mais recente para o mais antigo", "remover algo inexistente avisa"...

Para testar as peças de nuvem sem mexer no Supabase de verdade, o arquivo `docker-compose.yml`
liga no seu computador um Postgres e um S3 de mentira. O comando é `make test-integracao`.

Resultado: **53 testes passando** com as peças de nuvem (eram 26 antes deste passo). Sem Docker,
`make test` roda só a parte local e pula as de nuvem, avisando o motivo.

## A API numa "caixa": o Dockerfile

O `backend/Dockerfile` é a receita para empacotar a API com tudo o que ela precisa: Python,
pandas e o código. Essa caixa (um **container**) roda igual em qualquer serviço que aceite Docker:
Render, Railway, Fly.io, Google Cloud Run ou um servidor alugado.

Testamos a caixa de ponta a ponta: ela subiu, criou o "balde" de arquivos, importou um CSV,
gravou no Postgres, mostrou as linhas e removeu.

**Por que recomendo a API num container, e não na Vercel:** a caixa ficou com cerca de 740 MB,
quase tudo pandas e pyarrow (as bibliotecas que leem as planilhas). As funções Python da Vercel
têm limite de tamanho e de tempo, e um CSV grande pode estourar os dois. Num container não há esse
problema, e ainda some o limite de 4,5 MB por envio da Vercel. O site continua na Vercel. A
decisão final fica para o passo 3.

## E o site?

O site já estava preparado. A ferramenta que monta o site para produção (Nitro) **detecta
sozinha** quando está rodando na Vercel. Em outro lugar, basta uma variável (`NITRO_PRESET`).
Testamos o build para a Vercel e ele funcionou.

Uma regra que mantém o site portátil: **o site só conversa com a nossa API**, nunca direto com o
banco. Se o banco mudar, o site nem percebe.

## Arquivos criados ou alterados

| Arquivo | Papel |
| --- | --- |
| `backend/app/shared/arquivos/` | A tomada de arquivos e suas duas peças: `pasta_local.py` e `bucket_s3.py`. |
| `backend/app/shared/banco/` | Conexão com o Postgres e o aplicador de migrações. |
| `backend/app/features/datasets/catalogo/` | A tomada do catálogo e suas duas peças: `arquivos_json.py` e `postgres.py`. |
| `backend/app/features/datasets/repository.py` | Junta catálogo + arquivos. É o que as funcionalidades usam (não mudou por fora). |
| `backend/app/features/datasets/dependencies.py` | Lê a configuração e liga as peças certas. |
| `backend/app/shared/config.py` | Novas variáveis (`DATAPULSE_DATABASE_URL`, `DATAPULSE_S3_*`) e leitura do `backend/.env`. |
| `backend/app/preparar.py` | O comando `make migrar`. |
| `backend/migrations/0001_criar_datasets.sql` | A planta da tabela `datasets`. |
| `backend/Dockerfile` e `.dockerignore` | A caixa da API. |
| `docker-compose.yml` | Postgres e S3 de mentira para testes. |
| `backend/tests/shared/`, `test_catalogo.py`, `test_fluxo_na_nuvem.py` | Os testes de contrato. |

## Dois detalhes pequenos

- As datas de importação agora são gravadas em **UTC** (o horário de referência mundial). Bancos
  na nuvem ficam em outros fusos, e assim todo mundo concorda sobre "quando". O site converte para
  o seu horário ao mostrar. Datasets antigos, sem fuso, são lidos como UTC.
- O arquivo temporário do upload agora vai para a pasta temporária do sistema, que existe em
  qualquer hospedagem, em vez de `backend/storage/tmp`.
