# Passo 4: Colocar o site no ar (Vercel)

Fazer **depois** do passo 3, porque o site precisa saber o endereço da API.

## O que já deixei pronto

- `Frontend/vercel.json`: diz à Vercel como instalar (`bun install`) e montar (`bun run build`) o site.
- O site detecta sozinho que está sendo montado na Vercel (passo 1). Testamos esse build aqui.

## O que você faz

1. Entre em **vercel.com** com **"Continue with GitHub"**.
2. **Add New...** → **Project** → escolha **vinigoezz/DataPulse** → **Import**.
3. Antes de clicar em Deploy, ajuste:
   - **Project Name:** `datapulse`. A API só aceita endereços que começam com `datapulse`.
   - **Root Directory:** clique em **Edit** e escolha a pasta **`Frontend`**.
   - **Environment Variables:** adicione
     `VITE_API_URL` = o endereço da API do passo 3 (ex.: `https://datapulse-api.onrender.com`,
     **sem** `/` no final).
4. Clique em **Deploy**. Leva 1 a 3 minutos.
5. Abra o endereço que a Vercel mostrar. O topo de **Meus Datasets** **não** deve dizer
   "demonstração". Se a API estiver dormindo, o primeiro carregamento demora cerca de 1 minuto.

## Se aparecer erro

| Sintoma | Causa provável |
| --- | --- |
| O site diz "demonstração (API não configurada)" | `VITE_API_URL` não foi cadastrada antes do build. Cadastre e faça **Redeploy**. |
| "Não foi possível conectar à API" | A API está acordando (espere 1 min e clique em Tentar novamente) ou o endereço está errado. |
| Erro de CORS no console do navegador | O nome do projeto na Vercel não começa com `datapulse`. |
