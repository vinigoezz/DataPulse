"""Detecção e conversão de colunas de data (dd/mm/aaaa, ISO e variações)."""

import re
import warnings

import pandas as pd

# Fração mínima de valores que precisam ser datas válidas para a coluna ser convertida.
LIMIAR_DATA = 0.9
# Linhas usadas para testar se uma coluna de texto contém datas.
TAMANHO_AMOSTRA = 1000

# Só dígitos ("00123", "2026") não é data: é código ou número. Sem esta regra, o formato
# "mixed" do pandas lê "00123" como o ano 123.
SO_DIGITOS = re.compile(r"^\d+$")

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
        if amostra.empty or amostra.astype("string").str.strip().str.fullmatch(SO_DIGITOS).any():
            continue
        formato = descobrir_formato(amostra)
        if formato is None:
            continue
        convertida = para_data(df[coluna], formato)
        if convertida.notna().sum() / df[coluna].notna().sum() >= LIMIAR_DATA:
            df[coluna] = convertida
    return df
