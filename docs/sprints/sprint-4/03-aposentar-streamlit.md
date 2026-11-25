# Passo 3: Aposentar o Streamlit

O DataPulse começou como um app em **Streamlit** (`app.py`): uma página só, em Python, para testar
a ideia. O site novo (Frontend + API) agora cobre o que ele fazia:

| No Streamlit | No site novo |
| --- | --- |
| Enviar CSV, escolher separador e codificação | **Importar** (separador e codificação são detectados sozinhos) |
| Ver a tabela | **Explorador**, com busca, filtros, faixas e páginas |
| Tipos das colunas e estatísticas | **Explorador**: cartões e perfil das colunas |
| Barras por categoria | **Dashboard**: comparação |
| Evolução no tempo | **Dashboard**: evolução |
| Histograma e dispersão (X × Y) | **Ainda não existem**. Ficaram anotados no roadmap, para fazer se fizerem falta. |

## O que foi removido

- `app.py`: o app Streamlit.
- `requirements.txt` da raiz: as bibliotecas do Streamlit (a API tem as dela em `backend/`).
- `.streamlit/config.toml`: a configuração do Streamlit.
- As instruções de uso no `README.md`.

Tudo continua guardado no **histórico do Git**, caso um dia seja preciso consultar.

A imagem que está em `.streamlit/` **não foi apagada**: ela nunca esteve no Git (é ignorada pelo
`.gitignore`), então apagá-la não teria volta. Se não precisar mais dela, pode apagar a pasta
`.streamlit/` você mesmo.
