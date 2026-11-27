# DataPulse

Análise de dados a partir de planilhas CSV e Excel.

**No ar:** site https://data-pulse-gamma.vercel.app · API https://datapulse-api-uqj2.onrender.com/docs

| Pasta | O que é |
| --- | --- |
| `Frontend/` | Landing page e aplicação web (TanStack Start + React, conectado ao Lovable) |
| `backend/` | API FastAPI: importação, armazenamento, linhas, estatísticas e agregações |
| `docs/` | **Documentação**: comece por [`docs/README.md`](docs/README.md) |

| Documento | Para quem |
| --- | --- |
| [Guia do usuário](docs/GUIA-DO-USUARIO.md) | Quem usa o site |
| [Infraestrutura e operação](docs/INFRAESTRUTURA.md) | Quem publica, cuida das senhas e resolve problemas |
| [Guia de desenvolvimento](docs/DESENVOLVIMENTO.md) | Quem programa no projeto |
| [Arquitetura](docs/ARQUITETURA.md) | Organização do código e contrato da API |
| [Roadmap](docs/ROADMAP.md) | O que foi feito e o que falta |
| [`docs/sprints/`](docs/sprints/) | Cada passo de cada sprint, explicado para leigos |

## Como rodar

Requisitos: Python 3.12+, Node 20+ e [bun](https://bun.sh) (`npm install -g bun`).

```bash
make setup   # instala tudo (uma vez)
make dev     # sobe API (http://localhost:8000/docs) e Frontend juntos
make test    # roda os testes
make lint    # confere a qualidade do código
make migrar  # prepara o banco e os arquivos configurados em backend/.env
make         # lista todos os comandos
```

Configuração da API por variáveis de ambiente: veja `backend/.env.example`. O Frontend lê
`Frontend/.env.local` (criado pelo `make setup`), onde `VITE_API_URL` aponta para a API.

## Arquivos grandes

O proxy do Codespaces recusa uploads grandes (erro 413). Compacte o CSV antes de enviar;
o site e a API aceitam `.zip` ou `.gz` com um único CSV dentro:

- **macOS:** clique com o botão direito no arquivo → **Comprimir**, ou no terminal `gzip -k arquivo.csv`
- **Windows:** botão direito → **Enviar para** → **Pasta compactada**
