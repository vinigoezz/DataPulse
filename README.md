# DataPulse

Análise de dados a partir de planilhas CSV.

| Pasta | O que é |
| --- | --- |
| `Frontend/` | Landing page e aplicação web (TanStack Start + React, conectado ao Lovable) |
| `backend/` | API FastAPI: importação, armazenamento, linhas paginadas e estatísticas |
| `app.py` | Protótipo original em Streamlit |
| `docs/ARQUITETURA.md` | Visão da arquitetura, contrato da API e próximos passos |

## Como rodar

### API (backend)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload          # http://localhost:8000/docs
pytest                                 # testes
```

Configuração por variáveis de ambiente — veja `backend/.env.example`.

### Frontend

```bash
cd Frontend
bun install          # ou npm install
cp .env.example .env.local   # aponta para a API; sem ele o app usa dados de demonstração
bun run dev
```

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
