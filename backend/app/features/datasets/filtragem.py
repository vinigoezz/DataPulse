"""Filtros usados por mais de uma fatia (linhas e agregar): valor exato e faixa de número/data.

Formato na URL:
- ``filters``: ``{"filial": "Recife"}`` (valor exato, comparado como texto);
- ``ranges``: ``{"receita": {"min": 100, "max": 500}, "data": {"max": "2026-01-31"}}``.
"""

import json
from dataclasses import dataclass

import pandas as pd

from app.features.datasets.errors import ConsultaInvalida


@dataclass(frozen=True)
class Faixa:
    """Limites de uma coluna de número ou data. Qualquer um dos dois pode ficar em aberto."""

    minimo: float | str | None = None  # número, ou data ISO (2026-01-31)
    maximo: float | str | None = None


def ler_filtros(texto: str | None) -> dict[str, str]:
    """Converte o parâmetro `filters` da URL (JSON {"coluna": "valor"}) num dicionário."""
    if not texto:
        return {}
    try:
        filtros = json.loads(texto)
    except json.JSONDecodeError as erro:
        raise ConsultaInvalida("O parâmetro 'filters' precisa ser um JSON válido.") from erro
    if not isinstance(filtros, dict):
        raise ConsultaInvalida(
            'O parâmetro \'filters\' precisa ser um objeto: {"coluna": "valor"}.'
        )
    return {str(coluna): str(valor) for coluna, valor in filtros.items()}


def ler_faixas(texto: str | None) -> dict[str, Faixa]:
    """Converte o parâmetro `ranges` (JSON {"coluna": {"min": 1, "max": 9}}) em Faixas."""
    if not texto:
        return {}
    try:
        faixas = json.loads(texto)
    except json.JSONDecodeError as erro:
        raise ConsultaInvalida("O parâmetro 'ranges' precisa ser um JSON válido.") from erro
    if not isinstance(faixas, dict) or not all(isinstance(f, dict) for f in faixas.values()):
        raise ConsultaInvalida(
            'O parâmetro \'ranges\' precisa ser um objeto: {"coluna": {"min": 1, "max": 9}}.'
        )
    return {str(c): Faixa(f.get("min"), f.get("max")) for c, f in faixas.items()}


def validar_colunas(dados: pd.DataFrame, colunas: set[str]) -> None:
    inexistentes = sorted(colunas - set(dados.columns))
    if inexistentes:
        raise ConsultaInvalida(f"Coluna(s) inexistente(s): {', '.join(inexistentes)}.")


def aplicar_filtros(
    dados: pd.DataFrame, filtros: dict[str, str], faixas: dict[str, Faixa]
) -> pd.DataFrame:
    """Valor exato primeiro, depois faixas. Quem chama já validou as colunas."""
    return _filtrar_faixas(_filtrar(dados, filtros), faixas)


def como_texto(coluna: pd.Series) -> pd.Series:
    return coluna.astype("string")


def _filtrar(dados: pd.DataFrame, filtros: dict[str, str]) -> pd.DataFrame:
    for coluna, valor in filtros.items():
        dados = dados[como_texto(dados[coluna]) == valor]
    return dados


def _filtrar_faixas(dados: pd.DataFrame, faixas: dict[str, Faixa]) -> pd.DataFrame:
    for coluna, faixa in faixas.items():
        converter = _conversor_de_limite(dados[coluna], coluna)
        if faixa.minimo is not None:
            dados = _manter(dados, dados[coluna] >= converter(faixa.minimo, fim_do_dia=False))
        if faixa.maximo is not None:
            dados = _manter(dados, dados[coluna] <= converter(faixa.maximo, fim_do_dia=True))
    return dados


def _manter(dados: pd.DataFrame, condicao: pd.Series) -> pd.DataFrame:
    return dados[condicao.fillna(False).astype(bool)]  # vazios nunca entram numa faixa


def _conversor_de_limite(valores: pd.Series, coluna: str):
    if pd.api.types.is_datetime64_any_dtype(valores):
        return lambda limite, fim_do_dia: _data(limite, coluna, fim_do_dia)
    if pd.api.types.is_numeric_dtype(valores) and not pd.api.types.is_bool_dtype(valores):
        return lambda limite, fim_do_dia: _numero(limite, coluna)
    raise ConsultaInvalida(f"A coluna '{coluna}' não é de número nem de data: use 'filters'.")


def _numero(limite, coluna: str) -> float:
    try:
        return float(limite)
    except (TypeError, ValueError) as erro:
        raise _limite_invalido(coluna, limite) from erro


def _data(limite, coluna: str, fim_do_dia: bool) -> pd.Timestamp:
    try:
        data = pd.Timestamp(limite)
    except (TypeError, ValueError) as erro:
        raise _limite_invalido(coluna, limite) from erro
    so_dia = isinstance(limite, str) and len(limite) == len("2026-01-31")
    # "até 2026-01-31" inclui o dia 31 inteiro, não só a meia-noite.
    return (
        data + pd.Timedelta(days=1) - pd.Timedelta(microseconds=1)
        if fim_do_dia and so_dia
        else data
    )


def _limite_invalido(coluna: str, limite) -> ConsultaInvalida:
    return ConsultaInvalida(f"Limite inválido para a coluna '{coluna}': {limite!r}.")
