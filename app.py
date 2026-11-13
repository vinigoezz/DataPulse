import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="DataPulse", page_icon="📊", layout="wide")


@st.cache_data
def carregar_csv(arquivo, separador: str, encoding: str) -> pd.DataFrame:
    return pd.read_csv(arquivo, sep=separador, encoding=encoding)


st.title("📊 DataPulse")
st.write("Análise de dados a partir de planilhas CSV.")

nome = st.text_input("Qual seu nome?")
if nome:
    st.success(f"Bem-vindo ao DataPulse, {nome}!")

with st.sidebar:
    st.header("Configurações do arquivo")
    separador = st.selectbox(
        "Separador",
        options=[",", ";", "\t", "|"],
        format_func=lambda s: {"\t": "Tab"}.get(s, s),
    )
    encoding = st.selectbox("Codificação", options=["utf-8", "latin-1"])

arquivo = st.file_uploader("Envie um arquivo CSV", type=["csv"])

if arquivo is None:
    st.info("Envie um arquivo CSV para começar a análise.")
    st.stop()

try:
    df = carregar_csv(arquivo, separador, encoding)
except UnicodeDecodeError:
    st.error("Não foi possível ler o arquivo. Tente outra codificação na barra lateral.")
    st.stop()
except (pd.errors.ParserError, pd.errors.EmptyDataError) as erro:
    st.error(f"Erro ao ler o CSV: {erro}")
    st.stop()

if df.empty:
    st.warning("O arquivo não contém dados.")
    st.stop()

# Resumo
col1, col2, col3, col4 = st.columns(4)
col1.metric("Linhas", f"{len(df):,}".replace(",", "."))
col2.metric("Colunas", len(df.columns))
col3.metric("Valores ausentes", int(df.isna().sum().sum()))
col4.metric("Linhas duplicadas", int(df.duplicated().sum()))

aba_dados, aba_estat, aba_graf = st.tabs(["Dados", "Estatísticas", "Gráficos"])

with aba_dados:
    st.dataframe(df, width="stretch")
    tipos = pd.DataFrame(
        {
            "Tipo": df.dtypes.astype(str),
            "Ausentes": df.isna().sum(),
            "Valores únicos": df.nunique(),
        }
    )
    st.subheader("Colunas")
    st.dataframe(tipos, width="stretch")

numericas = df.select_dtypes(include="number").columns.tolist()
categoricas = [c for c in df.columns if c not in numericas]

with aba_estat:
    if numericas:
        st.dataframe(df[numericas].describe().T, width="stretch")
    else:
        st.info("Nenhuma coluna numérica encontrada.")

with aba_graf:
    if not numericas:
        st.info("É preciso ao menos uma coluna numérica para gerar gráficos.")
    else:
        tipo = st.radio(
            "Tipo de gráfico",
            ["Histograma", "Dispersão", "Barras (média por categoria)"],
            horizontal=True,
        )
        if tipo == "Histograma":
            coluna = st.selectbox("Coluna", numericas)
            st.plotly_chart(px.histogram(df, x=coluna), width="stretch")
        elif tipo == "Dispersão":
            if len(numericas) < 2:
                st.info("São necessárias pelo menos duas colunas numéricas.")
            else:
                x = st.selectbox("Eixo X", numericas, index=0)
                y = st.selectbox("Eixo Y", numericas, index=1)
                st.plotly_chart(px.scatter(df, x=x, y=y), width="stretch")
        else:
            if not categoricas:
                st.info("Nenhuma coluna categórica encontrada.")
            else:
                cat = st.selectbox("Categoria", categoricas)
                valor = st.selectbox("Valor", numericas)
                agrupado = df.groupby(cat, as_index=False)[valor].mean()
                st.plotly_chart(px.bar(agrupado, x=cat, y=valor), width="stretch")
