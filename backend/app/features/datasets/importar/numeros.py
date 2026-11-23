"""Detecção e conversão de colunas numéricas: formato brasileiro, internacional, R$ e %.

Exemplos que viram número:
- ``1.234,56`` / ``45,50`` / ``-3`` (brasileiro: ponto separa milhar, vírgula separa decimal)
- ``1,234.56`` / ``45.50`` (internacional)
- ``R$ 1.234,56`` (moeda) e ``15%`` / ``12,5 %`` (percentual, guardado como fração: 0,15)
- ``(1.234,56)`` (negativo no estilo contábil)

Valores como ``1.500`` são ambíguos (mil e quinhentos? um e meio?). Nesse caso vale a convenção
preferida do arquivo: brasileira se o separador de colunas for ``;``, internacional se for ``,``.
"""

import re
from dataclasses import dataclass
from typing import Literal

import pandas as pd

from app.features.datasets.models import CHAVE_TIPOS

# Fração mínima de valores preenchidos que precisam ser números para a coluna ser convertida.
LIMIAR_NUMERO = 0.9
# Linhas usadas para testar se uma coluna de texto contém números.
TAMANHO_AMOSTRA = 1000

TipoNumerico = Literal["moeda", "percentual"]


@dataclass(frozen=True)
class Convencao:
    nome: str
    milhar: str
    decimal: str
    padrao: re.Pattern[str]


BRASILEIRA = Convencao("brasileira", ".", ",", re.compile(r"^[+-]?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$"))
INTERNACIONAL = Convencao(
    "internacional", ",", ".", re.compile(r"^[+-]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$")
)

_MOEDA = re.compile(r"R\$")
_ESPACOS = re.compile(r"\s+")  # inclui o espaço "duro" (\xa0) que o Excel coloca
_CONTABIL = re.compile(r"^\((.*)\)$")
# Parece número, mas é código: zero à esquerda (00123, CEP sem traço) ou longo demais para
# caber num número sem perder dígitos (CPF/CNPJ sem pontuação, cartões, chaves).
_CODIGO = re.compile(r"^0\d|^\d{16,}$")


def convencao_preferida(separador: str) -> Convencao:
    return BRASILEIRA if separador == ";" else INTERNACIONAL


def converter_numeros(df: pd.DataFrame, preferida: Convencao) -> pd.DataFrame:
    """Converte as colunas de texto em que quase todos os valores são números.

    Moeda e percentual ficam anotados em ``df.attrs[CHAVE_TIPOS]``, que o Parquet preserva.
    """
    df = df.copy()
    tipos: dict[str, TipoNumerico] = dict(df.attrs.get(CHAVE_TIPOS, {}))
    for coluna in df.select_dtypes(include=["object", "string"]).columns:
        texto = df[coluna].astype("string")
        amostra = texto.dropna().head(TAMANHO_AMOSTRA)
        if amostra.empty:
            continue
        if amostra.str.strip().str.contains(_CODIGO).any():
            continue
        tipo = _tipo_por_simbolo(amostra)
        convencao = _escolher_convencao(_limpar(amostra), preferida)
        if convencao is None:
            continue
        numeros = _para_numero(_limpar(texto), convencao)
        if numeros.notna().sum() < LIMIAR_NUMERO * texto.notna().sum():
            continue
        if tipo == "percentual":
            numeros = numeros / 100
        df[coluna] = _inteiro_se_possivel(numeros, texto, convencao)
        if tipo:
            tipos[coluna] = tipo
    df.attrs[CHAVE_TIPOS] = tipos
    return df


def _tipo_por_simbolo(amostra: pd.Series) -> TipoNumerico | None:
    if amostra.str.contains(_MOEDA).mean() >= LIMIAR_NUMERO:
        return "moeda"
    if amostra.str.strip().str.endswith("%").mean() >= LIMIAR_NUMERO:
        return "percentual"
    return None


def _limpar(texto: pd.Series) -> pd.Series:
    """Tira R$, %, espaços e troca ``(x)`` por ``-x``. Sobra só o número escrito."""
    texto = texto.str.replace(_MOEDA, "", regex=True).str.replace("%", "", regex=False)
    texto = texto.str.replace(_ESPACOS, "", regex=True)
    return texto.str.replace(_CONTABIL, r"-\1", regex=True)


def _escolher_convencao(amostra: pd.Series, preferida: Convencao) -> Convencao | None:
    acertos = {c: amostra.str.fullmatch(c.padrao).mean() for c in (BRASILEIRA, INTERNACIONAL)}
    candidatas = [c for c, taxa in acertos.items() if taxa >= LIMIAR_NUMERO]
    if not candidatas:
        return None
    if len(candidatas) == 2 and acertos[BRASILEIRA] == acertos[INTERNACIONAL]:
        return preferida
    return max(candidatas, key=lambda c: acertos[c])


def _para_numero(texto: pd.Series, convencao: Convencao) -> pd.Series:
    valido = texto.str.fullmatch(convencao.padrao).fillna(False)
    normalizado = (
        texto.where(valido)
        .str.replace(convencao.milhar, "", regex=False)
        .str.replace(convencao.decimal, ".", regex=False)
    )
    return pd.to_numeric(normalizado, errors="coerce").astype("Float64")


def _inteiro_se_possivel(numeros: pd.Series, texto: pd.Series, convencao: Convencao) -> pd.Series:
    """Colunas só com números inteiros (sem casa decimal escrita) ficam como inteiros."""
    tem_decimal = texto.str.contains(re.escape(convencao.decimal) + r"\d", regex=True).any()
    validos = numeros.dropna()
    if tem_decimal or validos.empty or not (validos == validos.round()).all():
        return numeros
    return numeros.astype("Int64")
