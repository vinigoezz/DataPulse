# Passo 3: Colocar a API no ar (Render)

## Por que Render

A API é uma "caixa" Docker (passo 1) de cerca de 740 MB, por causa das bibliotecas que leem
planilhas. O Render roda caixas Docker de graça e não tem o limite de 4,5 MB por envio que a
Vercel tem. Se um dia for preciso sair do Render, a mesma caixa roda no Railway, Fly.io, Google
Cloud Run etc.

## O que já deixei pronto

| Arquivo | Para quê |
| --- | --- |
| `render.yaml` (na raiz) | O "formulário de cadastro" da API no Render, já preenchido: nome, região (Ohio, perto do seu Supabase), plano grátis, onde está o Dockerfile e as configurações que não são segredo. |
| `backend/Dockerfile` | Agora, ao ligar, a caixa roda o `make migrar` sozinha antes de subir a API. Você não precisa lembrar de atualizar o banco a cada deploy. |

E duas melhorias na API:

- **CORS por padrão de endereço.** O navegador só deixa o site falar com a API se a API autorizar
  o endereço do site. A Vercel cria um endereço novo a cada versão de teste
  (`datapulse-abc123.vercel.app`), então a API aceita qualquer endereço que siga o padrão
  `datapulse...vercel.app`, e recusa os outros. Isso tem 3 testes novos.
- **Limite de 25 MB por arquivo no Render.** O plano grátis tem 512 MB de memória, e uma planilha
  ocupa muito mais memória aberta do que no disco. Arquivos `.zip`/`.gz` ajudam a enviar mais
  dados dentro do limite.

## O que você faz (uns 10 minutos)

1. Entre em **render.com** com **"GitHub"**.
2. No painel: **New +** → **Blueprint**.
3. Conecte o repositório **vinigoezz/DataPulse** (se pedir, autorize o Render a ver o repositório).
4. O Render lê o `render.yaml` e mostra o serviço **datapulse-api**. Ele vai pedir 3 valores, os
   segredos. Copie do seu `backend/.env`:        
   - `DATAPULSE_DATABASE_URL`
   - `DATAPULSE_S3_ACCESS_KEY`
   - `DATAPULSE_S3_SECRET_KEY`
5. Clique em **Apply** / **Deploy Blueprint**. A primeira vez demora uns 5 a 10 minutos (ele monta a caixa).
6. Quando ficar **Live**, copie o endereço do serviço (algo como
   `https://datapulse-api.onrender.com`) e abra `<endereço>/api/health`. Deve aparecer
   `{"status":"ok",...}`.
7. Me mande esse endereço (ele não é segredo).

## Coisas para saber do plano grátis

- **Ela "dorme".** Depois de 15 minutos sem uso, a API desliga. A próxima visita demora cerca de
  1 minuto para acordar. Para um MVP tudo bem. Um plano pago (a partir de ~US$ 7/mês) acaba com isso.
- **750 horas por mês**, o suficiente para uma API ligada o mês inteiro.
- **Deploy automático:** cada `git push` que mexa em `backend/` atualiza a API sozinho.

## O que deu errado na primeira tentativa

O deploy falhou e o log mostrava:

```
Banco: não consegui conectar. ... FATAL:  database "postgres
```

**Causa:** no campo `DATAPULSE_DATABASE_URL` do Render foi colada **mais de uma linha** (a do
banco e as seguintes do `.env`). O nome do banco virou "postgres + o resto do texto", e esse banco
não existe. A senha e o servidor estavam certos: a conexão chegou ao Supabase.

**Como corrigir:** no Render, abra **datapulse-api → Environment**, edite `DATAPULSE_DATABASE_URL`,
apague tudo e cole **só** o que vem depois do `=` naquela linha do `backend/.env`. Uma linha,
terminando em `/postgres`. Depois clique em **Save, rebuild and deploy**.

**Melhoria feita:** agora a API reconhece esse engano e avisa "foi colada mais de uma linha", em
vez da mensagem cortada do banco.
