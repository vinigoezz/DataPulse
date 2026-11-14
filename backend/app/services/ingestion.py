"""Leitura de CSV (puro, .zip ou .gz) e detecção de colunas de data.

Lógica extraída do protótipo Streamlit (app.py), sem dependência de UI.
"""

import csv
import gzip
import warnings
import zipfile
from pathlib import Path
from typing import IO

import pandas as pd

from app.core.errors import ArquivoInvalido

EXTENSOES = (".csv", ".zip", ".gz")
SEPARADORES = ",;\t|"
ENCODINGS = ("utf-8", "latin-1")

# Fração mínima de valores que precisam ser datas válidas para a coluna ser convertida.
LIMIAR_DATA = 0.9
# Linhas usadas para testar se uma coluna de texto contém datas.
TAMANHO_AMOSTRA = 1000
# Bytes lidos do início do arquivo para descobrir o separador.
BYTES_AMOSTRA = 64 * 1024

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


def extensao_valida(nome: str) -> bool:
    return nome.lower().endswith(EXTENSOES)


def abrir_csv(caminho: Path, nome_original: str) -> IO[bytes]:
    """Devolve um stream binário do CSV, descompactando .zip ou .gz se preciso."""
    nome = nome_original.lower()
    try:
        if nome.endswith(".gz"):
            return gzip.open(caminho)
        if nome.endswith(".zip"):
            pacote = zipfile.ZipFile(caminho)
            # O "Comprimir" do macOS inclui arquivos ocultos (__MACOSX/, ._nome) no .zip.
            csvs = [
                n
                for n in pacote.namelist()
                if n.lower().endswith(".csv")
                and not n.startswith("__MACOSX/")
                and not n.rsplit("/", 1)[-1].startswith("._")
            ]
            if len(csvs) != 1:
                raise ArquivoInvalido(
                    f"O .zip precisa conter exatamente um arquivo CSV (encontrados: {len(csvs)})."
                )
            return pacote.open(csvs[0])
    except zipfile.BadZipFile as erro:
        raise ArquivoInvalido(f"Não foi possível abrir o arquivo compactado: {erro}") from erro
    return open(caminho, "rb")


def detectar_encoding(caminho: Path, nome_original: str) -> str:
    """Primeiro encoding da lista que decodifica o início do arquivo."""
    with abrir_csv(caminho, nome_original) as stream:
        amostra = _ler_amostra(stream)
    for encoding in ENCODINGS:
        try:
            amostra.decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    return ENCODINGS[-1]


def detectar_separador(caminho: Path, nome_original: str, encoding: str) -> str:
    with abrir_csv(caminho, nome_original) as stream:
        amostra = _ler_amostra(stream).decode(encoding, errors="ignore")
    # Descarta a última linha, que pode ter sido cortada no meio.
    amostra = amostra.rsplit("\n", 1)[0] if "\n" in amostra else amostra
    try:
        return csv.Sniffer().sniff(amostra, delimiters=SEPARADORES).delimiter
    except csv.Error:
        return ","


def _ler_amostra(stream: IO[bytes]) -> bytes:
    try:
        return stream.read(BYTES_AMOSTRA)
    except (gzip.BadGzipFile, EOFError, zipfile.BadZipFile) as erro:
        raise ArquivoInvalido(f"Não foi possível abrir o arquivo compactado: {erro}") from erro


def ler_csv(
    caminho: Path,
    nome_original: str,
    separador: str | None = None,
    encoding: str | None = None,
) -> tuple[pd.DataFrame, str, str]:
    """Lê o arquivo e devolve (DataFrame, separador usado, encoding usado).

    Separador e encoding são detectados quando não informados.
    """
    encoding = encoding or detectar_encoding(caminho, nome_original)
    separador = separador or detectar_separador(caminho, nome_original, encoding)
    try:
        with abrir_csv(caminho, nome_original) as stream:
            df = pd.read_csv(stream, sep=separador, encoding=encoding)
    except UnicodeDecodeError as erro:
        raise ArquivoInvalido(
            f"Não foi possível ler o arquivo com a codificação {encoding}."
        ) from erro
    except (pd.errors.ParserError, pd.errors.EmptyDataError) as erro:
        raise ArquivoInvalido(f"Erro ao ler o CSV: {erro}") from erro
    except (gzip.BadGzipFile, EOFError, zipfile.BadZipFile) as erro:
        raise ArquivoInvalido(f"Não foi possível abrir o arquivo compactado: {erro}") from erro
    return normalizar_tipos(converter_datas(df)), separador, encoding


def normalizar_tipos(df: pd.DataFrame) -> pd.DataFrame:
    """Garante tipos que o Parquet aceita: colunas 'object' com tipos misturados viram texto."""
    df = df.copy()
    df.columns = [str(c) for c in df.columns]
    for coluna in df.columns:
        if df[coluna].dtype == object:
            df[coluna] = df[coluna].astype("string")
    return df


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
