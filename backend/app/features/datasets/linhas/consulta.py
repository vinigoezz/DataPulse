"""Busca, filtro, ordenação e paginação das linhas de um dataset."""

import json
import re
from dataclasses import dataclass, field
from typing import Any, Literal

import pandas as pd

from app.features.datasets.errors import ConsultaInvalida

Ordem = Literal["asc", "desc"]


@dataclass(frozen=True)
class Faixa:
    """Limites de uma coluna de número ou data. Qualquer um dos dois pode ficar em aberto."""

    minimo: float | str | None = None  # número, ou data ISO (2026-01-31)
    maximo: float | str | None = None


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
    selecionadas = _filtrar(dados, consulta.filtros)
    selecionadas = _filtrar_faixas(selecionadas, consulta.faixas)
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


def _validar_colunas(dados: pd.DataFrame, consulta: ConsultaDeLinhas) -> None:
    usadas = set(consulta.filtros) | set(consulta.faixas)
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
            contem |= _como_texto(coluna).str.contains(termo, case=False, regex=False).fillna(False)
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
