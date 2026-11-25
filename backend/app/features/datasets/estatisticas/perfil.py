"""Perfil das colunas: tipo semântico (o ColumnType do Frontend) e estatísticas básicas."""

import math
import re
from typing import Literal

import pandas as pd

from app.features.datasets.models import CHAVE_TIPOS
from app.shared.api_model import ApiModel

ColumnType = Literal["texto", "número", "moeda", "percentual", "data", "categoria"]
TIPOS_NUMERICOS = ("número", "moeda", "percentual")


class ColumnSchema(ApiModel):
    key: str
    label: str
    type: ColumnType


class ColumnStats(ColumnSchema):
    nulls: int
    distinct: int
    min: float | None = None
    max: float | None = None
    mean: float | None = None
    values: list[str] | None = None  # só em colunas "categoria": as opções para filtrar
    start: str | None = None  # só em colunas "data": a primeira e a última (ISO)
    end: str | None = None


# Colunas numéricas sem R$ nos valores, mas com estes nomes, também são exibidas como dinheiro.
PADRAO_MOEDA = re.compile(
    r"receita|valor|pre[cç]o|custo|faturamento|salario|salário|price|amount|revenue|cost",
    re.IGNORECASE,
)
# Texto com até este número de valores distintos é tratado como categoria.
MAX_CATEGORIAS = 50


def inferir_tipo(serie: pd.Series, anotado: str | None = None) -> ColumnType:
    """Tipo da coluna. ``anotado`` vem da importação (R$ → "moeda", % → "percentual")."""
    if pd.api.types.is_bool_dtype(serie):
        return "categoria"
    if pd.api.types.is_datetime64_any_dtype(serie):
        return "data"
    if pd.api.types.is_numeric_dtype(serie):
        if anotado in ("moeda", "percentual"):
            return anotado
        return "moeda" if PADRAO_MOEDA.search(str(serie.name)) else "número"
    preenchidos = int(serie.notna().sum())
    distintos = int(serie.nunique())
    # Poucos valores distintos e repetidos (ao menos 2 linhas por valor, em média).
    if preenchidos and distintos <= MAX_CATEGORIAS and distintos * 2 <= preenchidos:
        return "categoria"
    return "texto"


def esquema(df: pd.DataFrame) -> list[ColumnSchema]:
    anotacoes = df.attrs.get(CHAVE_TIPOS, {})
    return [
        ColumnSchema(key=c, label=c, type=inferir_tipo(df[c], anotacoes.get(c))) for c in df.columns
    ]


def _numero(valor) -> float | None:
    if valor is None or pd.isna(valor):
        return None
    valor = float(valor)
    return None if math.isinf(valor) else valor


def estatisticas(df: pd.DataFrame) -> list[ColumnStats]:
    resultado = []
    for coluna in esquema(df):
        serie = df[coluna.key]
        stats = ColumnStats(
            **coluna.model_dump(),
            nulls=int(serie.isna().sum()),
            distinct=int(serie.nunique()),
        )
        if coluna.type in TIPOS_NUMERICOS:
            stats.min = _numero(serie.min())
            stats.max = _numero(serie.max())
            stats.mean = _numero(serie.mean())
        if coluna.type == "data" and serie.notna().any():
            stats.start = serie.min().isoformat()
            stats.end = serie.max().isoformat()
        if coluna.type == "categoria":
            stats.values = sorted(serie.dropna().astype("string").unique().tolist())
        resultado.append(stats)
    return resultado
