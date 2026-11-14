import gzip
import warnings
import zipfile

import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="DataPulse", page_icon="📊", layout="wide")

# Fração mínima de valores que precisam ser datas válidas para a coluna ser convertida.
LIMIAR_DATA = 0.9
ROTULO_VAZIO = "(vazio)"
# Linhas usadas para testar se uma coluna de texto contém datas.
TAMANHO_AMOSTRA = 1000


class ArquivoCompactadoInvalido(ValueError):
    pass


# Formatos testados primeiro: com formato fixo o pandas converte milhões de linhas em segundos.
FORMATOS_DATA = [
    "%d/%m/%Y",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y %H:%M:%S",
    "%Y-%m-%d",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S",
    "%d-%m-%Y",
    "%d.%m.%Y",
]


def para_data(serie: pd.Series, formato: str) -> pd.Series:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        return pd.to_datetime(serie, errors="coerce", format=formato, dayfirst=True)


def descobrir_formato(amostra: pd.Series) -> str | None:
    """Devolve o formato de data que converte a amostra, ou None se não for data."""
    for formato in [*FORMATOS_DATA, "mixed"]:
        if para_data(amostra, formato).notna().mean() >= LIMIAR_DATA:
            return formato
    return None


def converter_datas(df: pd.DataFrame) -> pd.DataFrame:
    """Converte para datetime as colunas de texto em que quase todos os valores são datas.

    O formato é descoberto numa amostra; a coluna inteira só é convertida (com esse
    formato) se a amostra parecer data, o que mantém arquivos grandes rápidos.
    """
    df = df.copy()
    for coluna in df.select_dtypes(include=["object", "string"]).columns:
        amostra = df[coluna].dropna().head(TAMANHO_AMOSTRA)
        if amostra.empty:
            continue
        formato = descobrir_formato(amostra)
        if formato is None:
            continue
        convertida = para_data(df[coluna], formato)
        if convertida.notna().sum() / df[coluna].notna().sum() >= LIMIAR_DATA:
            df[coluna] = convertida
    return df


def abrir_csv(arquivo):
    """Devolve o CSV pronto para leitura, descompactando .zip ou .gz se preciso."""
    nome = arquivo.name.lower()
    if nome.endswith(".gz"):
        return gzip.open(arquivo)
    if nome.endswith(".zip"):
        pacote = zipfile.ZipFile(arquivo)
        # O "Comprimir" do macOS inclui arquivos ocultos (__MACOSX/, ._nome) no .zip.
        csvs = [
            n
            for n in pacote.namelist()
            if n.lower().endswith(".csv")
            and not n.startswith("__MACOSX/")
            and not n.rsplit("/", 1)[-1].startswith("._")
        ]
        if len(csvs) != 1:
            raise ArquivoCompactadoInvalido(
                f"O .zip precisa conter exatamente um arquivo CSV (encontrados: {len(csvs)})."
            )
        return pacote.open(csvs[0])
    return arquivo


@st.cache_data
def carregar_csv(arquivo, separador: str, encoding: str) -> pd.DataFrame:
    df = pd.read_csv(abrir_csv(arquivo), sep=separador, encoding=encoding)
    return converter_datas(df)


st.title("📊 DataPulse")
st.write("Análise de dados a partir de planilhas CSV.")

with st.sidebar:
    st.header("Configurações do arquivo")
    separador = st.selectbox(
        "Separador",
        options=[",", ";", "\t", "|"],
        format_func=lambda s: {"\t": "Tab"}.get(s, s),
    )
    encoding = st.selectbox("Codificação", options=["utf-8", "latin-1"])

arquivo = st.file_uploader(
    "Envie um arquivo CSV",
    type=["csv", "zip", "gz"],
    help="Arquivos grandes podem ser enviados compactados (.zip ou .gz) com um único CSV dentro.",
)

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
except (ArquivoCompactadoInvalido, zipfile.BadZipFile, gzip.BadGzipFile, EOFError) as erro:
    st.error(f"Não foi possível abrir o arquivo compactado: {erro}")
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

numericas = df.select_dtypes(include="number").columns.tolist()
datas = df.select_dtypes(include="datetime").columns.tolist()
categoricas = [c for c in df.columns if c not in numericas and c not in datas]

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
    if datas:
        st.caption("Colunas reconhecidas como data: " + ", ".join(map(str, datas)))

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
            [
                "Histograma",
                "Dispersão",
                "Barras (média por categoria)",
                "Linha (média por data)",
            ],
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
        elif tipo == "Barras (média por categoria)":
            if not categoricas:
                st.info("Nenhuma coluna categórica encontrada.")
            else:
                cat = st.selectbox("Categoria", categoricas)
                valor = st.selectbox("Valor", numericas)
                limite = st.slider("Máximo de categorias", 5, 50, 20)

                # Valores vazios viram um grupo próprio em vez de sumirem do gráfico.
                rotulos = df[cat].astype("string").fillna(ROTULO_VAZIO)
                mais_frequentes = rotulos.value_counts().head(limite).index
                agrupado = (
                    df.assign(**{cat: rotulos})[rotulos.isin(mais_frequentes)]
                    .groupby(cat, as_index=False, dropna=False)[valor]
                    .mean()
                    .sort_values(valor, ascending=False)
                )
                total = rotulos.nunique()
                if total > limite:
                    st.caption(
                        f"Mostrando as {limite} categorias mais frequentes de {total}."
                    )
                st.plotly_chart(px.bar(agrupado, x=cat, y=valor), width="stretch")
        else:
            if not datas:
                st.info("Nenhuma coluna de data encontrada.")
            else:
                coluna_data = st.selectbox("Data", datas)
                valor = st.selectbox("Valor", numericas)
                periodo = st.selectbox(
                    "Agrupar por",
                    options=["D", "W", "MS", "YS"],
                    format_func=lambda p: {
                        "D": "Dia",
                        "W": "Semana",
                        "MS": "Mês",
                        "YS": "Ano",
                    }[p],
                    index=2,
                )
                serie = (
                    df.dropna(subset=[coluna_data])
                    .set_index(coluna_data)[valor]
                    .resample(periodo)
                    .mean()
                    .reset_index()
                )
                st.plotly_chart(
                    px.line(serie, x=coluna_data, y=valor, markers=True),
                    width="stretch",
                )
