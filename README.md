# DataPulse

Análise de dados a partir de planilhas CSV, feita com Streamlit.

## Como rodar

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
o app aceita `.zip` ou `.gz` com um único CSV dentro:

- **macOS:** clique com o botão direito no arquivo → **Comprimir**, ou no terminal `gzip -k arquivo.csv`
- **Windows:** botão direito → **Enviar para** → **Pasta compactada**
