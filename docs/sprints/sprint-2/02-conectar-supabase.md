# Passo 2: Conectar ao Supabase

Já existe um `backend/.env` com o endereço do seu projeto preenchido. Faltam **três informações**,
que só você tem. **Não cole nenhuma delas no chat**: elas vão direto no arquivo.

## 1. Endereço do banco (com a senha)

1. Abra o projeto no painel do Supabase.
2. Clique no botão **Connect**, no topo.
3. Escolha **Session pooler** (o "Direct connection" não funciona no Codespaces nem na maioria das
   hospedagens).
4. Copie a linha que começa com `postgresql://postgres.ngdncripmhnkunjfevqw:...`.
5. Troque `[YOUR-PASSWORD]` pela **senha do banco**, a que você gerou ao criar o projeto. Não é a
   `anon key`. Se não lembrar, gere outra em **Project Settings → Database → Reset database password**.
6. Cole depois de `DATAPULSE_DATABASE_URL=` no `backend/.env`.

## 2. Chaves de arquivos (S3)

1. No menu lateral, abra **Storage** e procure **S3** (em algumas versões: **Storage → Settings →
   S3 Connection**).
2. Confira o **Endpoint** e a **Region** mostrados ali. Se forem diferentes dos que estão no
   `backend/.env` (`DATAPULSE_S3_ENDPOINT` e `DATAPULSE_S3_REGION`), use os do painel.
3. Clique em **New access key**, dê um nome (ex.: `datapulse-api`) e confirme.
4. Copie o **Access key ID** para `DATAPULSE_S3_ACCESS_KEY` e o **Secret access key** para
   `DATAPULSE_S3_SECRET_KEY`. A secreta só aparece uma vez.
5. Tire o `#` do começo da linha `# DATAPULSE_S3_BUCKET=datapulse`.

## 3. Montar o banco

No terminal:

```
make migrar
```

Deve aparecer algo como:

```
Banco: 1 migração(ões) aplicada(s) ['0001_criar_datasets.sql']
Arquivos: bucket 'datapulse' criado.
```

Rodar de novo mostra "Banco: em dia." e "já existe". Depois, `make dev` e importe um CSV: ele vai
para o Supabase. Dá para conferir no painel, em **Table Editor → datasets** e em **Storage**.

## Sobre o `Frontend/.env.local`

As linhas `SUPABASE_URL` e `SUPABASE_ANON_KEY` que você colocou lá **não são usadas**: o site só
conversa com a nossa API, e quem fala com o Supabase é a API. Pode apagá-las. Elas não vazam
(só variáveis que começam com `VITE_` chegam ao navegador), mas não têm função. Repare também que o
valor de `SUPABASE_URL` era o endereço do **painel** (`supabase.com/dashboard/...`), e não o do
projeto.

## O que deu errado na primeira tentativa (e como foi resolvido)

O `make migrar` falhou com uma mensagem estranha:

```
failed to resolve host 'postgres.ngdncripmhnkunjfevqw': Servname not supported
```

**A causa:** a linha `DATAPULSE_DATABASE_URL` estava **cortada**. Ela terminava logo depois da
senha. Um endereço de banco tem quatro partes, e faltavam as duas últimas:

```
postgresql://postgres.ngdncripmhnkunjfevqw:SENHA@aws-0-us-east-2.pooler.supabase.com:5432/postgres
            └──────── usuário ──────────┘ └senha┘ └────────────── servidor ─────────────┘ └porta┘ └banco┘
```

Sem o `@servidor`, o programa achou que o **usuário** era o servidor e a **senha** era a porta.
Daí o erro sem sentido.

Isso costuma acontecer quando se copia a linha em pedaços para trocar o `[YOUR-PASSWORD]`. O jeito
seguro é colar a linha **inteira** e depois apagar só `[YOUR-PASSWORD]` (incluindo os colchetes),
digitando a senha no lugar.

**O conserto:**

1. Testamos os servidores possíveis da sua região. Seu projeto está em **us-east-2** (Ohio, EUA),
   e o servidor certo é `aws-0-us-east-2.pooler.supabase.com`.
2. Completamos a linha e tiramos o `#` de `DATAPULSE_S3_BUCKET`, que tinha ficado comentada.
3. `make migrar` criou a tabela `datasets` e o bucket `datapulse`.
4. Teste completo no Supabase de verdade: importar, listar, ver linhas, conferir no banco e no
   Storage, remover. Tudo certo. Conferimos também que a tabela está protegida (RLS ligado) e que
   o bucket é **privado** (abrir um arquivo pelo link público é recusado).

**Melhoria feita:** agora, se o endereço estiver incompleto, o `make migrar` avisa em português o
que falta, sem mostrar a senha:

```
Banco: DATAPULSE_DATABASE_URL inválida. Falta o final com o servidor (ex.: ...@servidor:5432/postgres).
```

**Sobre a região:** o projeto foi criado nos EUA, e não em São Paulo. Funciona normalmente; cada
consulta só demora uns milissegundos a mais. Não vale recriar o projeto por isso agora.
