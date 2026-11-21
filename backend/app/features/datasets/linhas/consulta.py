"""Busca, filtro, ordenação e paginação das linhas de um dataset."""

import json
from dataclasses import dataclass, field
from typing import Any, Literal

import pandas as pd

from app.features.datasets.errors import ConsultaInvalida

Ordem = Literal["asc", "desc"]


@dataclass(frozen=True)
class ConsultaDeLinhas:
    pagina: int = 1
    tamanho: int = 25
    busca: str = ""
    filtros: dict[str, str] = field(default_factory=dict)  # coluna -> valor exato
    ordenar_por: str | None = None
    ordem: Ordem = "asc"


@dataclass(frozen=True)
class ResultadoDaConsulta:
    linhas: list[dict[str, Any]]
    total: int  # linhas que atendem à busca e aos filtros (antes de paginar)


def consultar(dados: pd.DataFrame, consulta: ConsultaDeLinhas) -> ResultadoDaConsulta:
    _validar_colunas(dados, consulta)
    selecionadas = _filtrar(dados, consulta.filtros)
    selecionadas = _buscar(selecionadas, consulta.busca)
    selecionadas = _ordenar(selecionadas, consulta.ordenar_por, consulta.ordem)
    return ResultadoDaConsulta(
        linhas=_pagina(selecionadas, consulta.pagina, consulta.tamanho),
        total=len(selecionadas),
    )


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


def _validar_colunas(dados: pd.DataFrame, consulta: ConsultaDeLinhas) -> None:
    usadas = set(consulta.filtros)
    if consulta.ordenar_por:
        usadas.add(consulta.ordenar_por)
    inexistentes = sorted(usadas - set(dados.columns))
    if inexistentes:
        raise ConsultaInvalida(f"Coluna(s) inexistente(s): {', '.join(inexistentes)}.")


def _como_texto(coluna: pd.Series) -> pd.Series:
    return coluna.astype("string")


def _filtrar(dados: pd.DataFrame, filtros: dict[str, str]) -> pd.DataFrame:
    for coluna, valor in filtros.items():
        dados = dados[_como_texto(dados[coluna]) == valor]
    return dados


def _buscar(dados: pd.DataFrame, termo: str) -> pd.DataFrame:
    termo = termo.strip()
    if not termo or dados.empty:
        return dados
    contem = pd.Series(False, index=dados.index)
    for coluna in dados.columns:
        contem |= (
            _como_texto(dados[coluna]).str.contains(termo, case=False, regex=False).fillna(False)
        )
    return dados[contem]


def _ordenar(dados: pd.DataFrame, coluna: str | None, ordem: Ordem) -> pd.DataFrame:
    if not coluna:
        return dados
    # mergesort é estável: linhas empatadas mantêm a ordem original. Vazios vão para o fim.
    return dados.sort_values(coluna, ascending=ordem == "asc", kind="mergesort", na_position="last")


def _pagina(dados: pd.DataFrame, pagina: int, tamanho: int) -> list[dict[str, Any]]:
    inicio = (pagina - 1) * tamanho
    recorte = dados.iloc[inicio : inicio + tamanho]
    # to_json resolve NaN -> null e datas -> ISO 8601 de uma vez.
    return json.loads(recorte.to_json(orient="records", date_format="iso"))
