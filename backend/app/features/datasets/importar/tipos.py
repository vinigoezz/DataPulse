"""Tratamento de tipos comum a CSV e Excel: números, datas e nomes de coluna."""

import pandas as pd

from app.features.datasets.importar.datas import converter_datas
from app.features.datasets.importar.numeros import Convencao, converter_numeros


def tratar_tipos(df: pd.DataFrame, convencao: Convencao) -> pd.DataFrame:
    """Colunas de texto viram número ou data quando quase todos os valores são isso.

    Números antes de datas: assim "2026" ou "15" nunca são confundidos com datas.
    """
    return normalizar_tipos(converter_datas(converter_numeros(df, convencao)))


def normalizar_tipos(df: pd.DataFrame) -> pd.DataFrame:
    """Garante tipos que o Parquet aceita: colunas 'object' com tipos misturados viram texto."""
    df = df.copy()
    df.columns = [str(c) for c in df.columns]
    for coluna in df.columns:
        if df[coluna].dtype == object:
            df[coluna] = df[coluna].astype("string")
    return df
