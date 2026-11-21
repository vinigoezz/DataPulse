# Passo 5 — Plano ajustado para Vercel e Supabase

## A decisão

- **Vercel** vai hospedar o site (Frontend) e a API.
- **Supabase** vai guardar os dados (banco Postgres), os arquivos (Storage) e cuidar do login (Auth).

## O que isso muda no plano

A Vercel funciona de um jeito diferente de um servidor comum, e isso traz quatro consequências:

### 1. O disco da Vercel “esquece” tudo

Hoje a API guarda as planilhas numa pasta do computador (`backend/storage/`). Na Vercel, cada
pedido pode rodar numa máquina nova, e o que foi gravado no disco some. É como anotar num quadro
que é apagado toda noite.

**Solução:** guardar a ficha de cada planilha (nome, data, número de linhas) no **banco do
Supabase** e o arquivo de dados no **Storage do Supabase**. Como no passo 2 isolamos todo o
armazenamento no `repository.py`, só esse arquivo ganha uma versão nova. O resto do código não
muda.

### 2. A Vercel recusa envios grandes

Cada pedido enviado para a API na Vercel pode ter no máximo **cerca de 4,5 MB**. Muitas planilhas
são maiores que isso.

**Solução:** o navegador envia o arquivo **direto para o Supabase Storage**, que aceita arquivos
grandes, e só avisa a API: “o arquivo X chegou, pode processar”.

### 3. A API pode ficar “pesada” demais

A API usa duas bibliotecas grandes, **pandas** e **pyarrow**, para ler e guardar planilhas. A
Vercel tem limite de tamanho para cada função. Vamos descobrir no primeiro deploy se cabe; se não
couber, ainda é cedo e barato trocar de abordagem.

### 4. O Frontend precisa “saber” que vai para a Vercel

A ferramenta que empacota o site (Nitro) hoje está configurada, por padrão, para outra hospedagem
(Cloudflare). No deploy ajustamos para a Vercel.

## Por que o deploy subiu para o Sprint 2

No plano anterior, o deploy ficava para o fim. Com essas quatro questões, é melhor **publicar cedo**:
se algo não funcionar na Vercel, descobrimos com pouco código construído em cima. A nova ordem:

| Sprint | Tema |
| --- | --- |
| 0 | Arrumação (este) |
| 1 | Frontend com dados reais + Frontend em vertical slices |
| 2 | **Supabase + primeiro deploy na Vercel** |
| 3 | Números no formato brasileiro + Explorador rápido |
| 4 | Dashboard real (e aposentar o protótipo Streamlit) |
| 5 | Login (Supabase Auth), contas de usuário e relatórios |
| 6 | Data Pulse AI (opcional) |

O **Docker Compose** e a **fila de processamento** saíram do plano: a Vercel e o Supabase já fazem
esse papel.

## Um cuidado com o Lovable

O Lovable tem regras próprias sobre bancos de dados: ele “toma conta” de uma pasta
`Frontend/supabase/`. Para não haver conflito, as definições do nosso banco ficarão em `supabase/`
na **raiz** do projeto, fora da área do Lovable.

## Arquivos alterados

- `docs/ROADMAP.md` (novo): todas as sprints com checklist
- `docs/ARQUITETURA.md`: seções novas “Hospedagem” e “Backend em vertical slices”
