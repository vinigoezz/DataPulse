# DataPulse

Análise de dados a partir de planilhas CSV.

| Pasta | O que é |
| --- | --- |
| `Frontend/` | Landing page e aplicação web (TanStack Start + React, conectado ao Lovable) |
| `backend/` | API FastAPI: importação, armazenamento, linhas paginadas e estatísticas |
| `app.py` | Protótipo original em Streamlit |
| `docs/ARQUITETURA.md` | Arquitetura (vertical slices), hospedagem e contrato da API |
| `docs/ROADMAP.md` | Sprints e o que falta |
| `docs/sprints/` | Explicação, passo a passo, do que foi feito em cada sprint (`sprint-0/`, `sprint-1/`...) |

## Como rodar

Requisitos: Python 3.12+, Node 20+ e [bun](https://bun.sh) (`npm install -g bun`).

```bash
make setup   # instala tudo (uma vez)
make dev     # sobe API (http://localhost:8000/docs) e Frontend juntos
make test    # roda os testes
make lint    # confere a qualidade do código
make         # lista todos os comandos
```

Configuração da API por variáveis de ambiente: veja `backend/.env.example`. O Frontend lê
`Frontend/.env.local` (criado pelo `make setup`); sem `VITE_API_URL` ele usa dados de demonstração.

### Protótipo Streamlit

```bash
pip install -r requirements.txt
streamlit run app.py
```

O `.streamlit/config.toml` mantém as proteções de CORS e XSRF do Streamlit ligadas.
Se o upload de arquivos falhar com erro 403 em ambientes com proxy (como GitHub Codespaces),
desligue a proteção XSRF só na execução local, sem alterar a configuração do projeto:

```bash
streamlit run app.py --server.enableXsrfProtection false
```

## Arquivos grandes

O proxy do Codespaces recusa uploads grandes (erro 413). Compacte o CSV antes de enviar;
o app e a API aceitam `.zip` ou `.gz` com um único CSV dentro:

- **macOS:** clique com o botão direito no arquivo → **Comprimir**, ou no terminal `gzip -k arquivo.csv`
- **Windows:** botão direito → **Enviar para** → **Pasta compactada**
