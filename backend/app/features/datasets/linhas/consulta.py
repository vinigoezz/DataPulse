"""Busca, ordenação e paginação das linhas de um dataset (filtros em ../filtragem.py)."""

import json
import re
from dataclasses import dataclass, field
from typing import Any, Literal

import pandas as pd

from app.features.datasets.filtragem import (
    Faixa,
    aplicar_filtros,
    como_texto,
    validar_colunas,
)

Ordem = Literal["asc", "desc"]


@dataclass(frozen=True)
class ConsultaDeLinhas:
    pagina: int = 1
    tamanho: int = 25
    busca: str = ""
    filtros: dict[str, str] = field(default_factory=dict)  # coluna -> valor exato
    faixas: dict[str, Faixa] = field(default_factory=dict)  # coluna -> entre mínimo e máximo
    ordenar_por: str | None = None
    ordem: Ordem = "asc"


@dataclass(frozen=True)
class ResultadoDaConsulta:
    linhas: list[dict[str, Any]]
    total: int  # linhas que atendem à busca e aos filtros (antes de paginar)


def consultar(dados: pd.DataFrame, consulta: ConsultaDeLinhas) -> ResultadoDaConsulta:
    _validar_colunas(dados, consulta)
    selecionadas = aplicar_filtros(dados, consulta.filtros, consulta.faixas)
    selecionadas = _buscar(selecionadas, consulta.busca)
    selecionadas = _ordenar(selecionadas, consulta.ordenar_por, consulta.ordem)
    return ResultadoDaConsulta(
        linhas=_pagina(selecionadas, consulta.pagina, consulta.tamanho),
        total=len(selecionadas),
    )


def _validar_colunas(dados: pd.DataFrame, consulta: ConsultaDeLinhas) -> None:
    usadas = set(consulta.filtros) | set(consulta.faixas)
    if consulta.ordenar_por:
        usadas.add(consulta.ordenar_por)
    validar_colunas(dados, usadas)


def _buscar(dados: pd.DataFrame, termo: str) -> pd.DataFrame:
    """Linhas que batem com o termo em alguma coluna, conforme o tipo da coluna:

    - texto: contém o termo (sem diferenciar maiúsculas);
    - número: igual ao termo, se ele for um número ("45,50" ou "45.5");
    - data: mesmo dia, se o termo for uma data ("05/01/2026" ou "2026-01-05").

    Não transformar números e datas em texto é o que deixa a busca rápida em arquivos grandes.
    """
    termo = termo.strip()
    if not termo or dados.empty:
        return dados
    numero, data = _como_numero(termo), _como_data(termo)
    contem = pd.Series(False, index=dados.index)
    for nome in dados.columns:
        coluna = dados[nome]
        if pd.api.types.is_datetime64_any_dtype(coluna):
            if data is not None:
                contem |= (coluna.dt.normalize() == data).fillna(False)
        elif pd.api.types.is_numeric_dtype(coluna) and not pd.api.types.is_bool_dtype(coluna):
            if numero is not None:
                contem |= (coluna == numero).fillna(False)
        else:
            contem |= como_texto(coluna).str.contains(termo, case=False, regex=False).fillna(False)
    return dados[contem]


_NUMERO = re.compile(r"^[+-]?\d[\d.,]*$")
_DATA = re.compile(r"^(\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2})$")


def _como_numero(termo: str) -> float | None:
    if not _NUMERO.match(termo):
        return None
    # Com vírgula, é brasileiro (1.234,56); sem vírgula, o ponto é decimal (45.5).
    normalizado = termo.replace(".", "").replace(",", ".") if "," in termo else termo
    try:
        return float(normalizado)
    except ValueError:
        return None


def _como_data(termo: str) -> pd.Timestamp | None:
    if not _DATA.match(termo):
        return None
    data = pd.to_datetime(termo, dayfirst="/" in termo, errors="coerce")
    return None if pd.isna(data) else data.normalize()


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
