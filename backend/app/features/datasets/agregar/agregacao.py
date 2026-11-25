"""Totais de um dataset: geral, por período (coluna de data) ou por categoria.

Para cada grupo devolve contagem e, se houver uma medida (coluna numérica), soma, média,
mínimo e máximo. É a base do Dashboard: os cartões usam o geral, os gráficos usam os grupos.
"""

import math
from dataclasses import dataclass, field
from typing import Literal

import pandas as pd

from app.features.datasets.errors import ConsultaInvalida
from app.features.datasets.filtragem import Faixa, aplicar_filtros, como_texto, validar_colunas
from app.shared.api_model import ApiModel

Intervalo = Literal["dia", "semana", "mes", "trimestre", "ano"]

# Período do pandas para cada intervalo (semana começa na segunda-feira).
FREQUENCIA: dict[Intervalo, str] = {
    "dia": "D",
    "semana": "W-SUN",
    "mes": "M",
    "trimestre": "Q",
    "ano": "Y",
}
# Mais pontos que isso não cabem num gráfico: pede-se um intervalo maior.
MAX_PERIODOS = 1000
VAZIO = "(vazio)"


@dataclass(frozen=True)
class PedidoDeAgregacao:
    medida: str | None = None  # coluna numérica; sem ela, só contagem
    agrupar_por: str | None = None  # coluna de data (períodos) ou de texto/categoria
    intervalo: Intervalo = "mes"
    limite: int = 10  # categorias mostradas; o resto vira "outros"
    filtros: dict[str, str] = field(default_factory=dict)
    faixas: dict[str, Faixa] = field(default_factory=dict)


class Resumo(ApiModel):
    count: int
    sum: float | None = None
    mean: float | None = None
    min: float | None = None
    max: float | None = None


class Grupo(Resumo):
    key: str  # nome da categoria, ou início do período em ISO (2026-01-01)


class Agregacao(ApiModel):
    overall: Resumo
    groups: list[Grupo]
    other: Resumo | None = None  # categorias além do limite, somadas


def agregar(dados: pd.DataFrame, pedido: PedidoDeAgregacao) -> Agregacao:
    _validar(dados, pedido)
    dados = aplicar_filtros(dados, pedido.filtros, pedido.faixas)
    valores = dados[pedido.medida] if pedido.medida else None
    overall = _resumo(len(dados), valores)
    if not pedido.agrupar_por:
        return Agregacao(overall=overall, groups=[])
    coluna = dados[pedido.agrupar_por]
    if pd.api.types.is_datetime64_any_dtype(coluna):
        return Agregacao(overall=overall, groups=_por_periodo(coluna, valores, pedido.intervalo))
    grupos, outros = _por_categoria(coluna, valores, pedido.limite)
    return Agregacao(overall=overall, groups=grupos, other=outros)


def _validar(dados: pd.DataFrame, pedido: PedidoDeAgregacao) -> None:
    usadas = set(pedido.filtros) | set(pedido.faixas)
    usadas |= {c for c in (pedido.medida, pedido.agrupar_por) if c}
    validar_colunas(dados, usadas)
    if pedido.medida and not _numerica(dados[pedido.medida]):
        raise ConsultaInvalida(f"A medida precisa ser uma coluna numérica: '{pedido.medida}'.")
    if pedido.agrupar_por and _numerica(dados[pedido.agrupar_por]):
        raise ConsultaInvalida(
            f"Agrupe por uma coluna de data ou de texto, não por números: '{pedido.agrupar_por}'."
        )


def _numerica(coluna: pd.Series) -> bool:
    return pd.api.types.is_numeric_dtype(coluna) and not pd.api.types.is_bool_dtype(coluna)


def _resumo(contagem: int, valores: pd.Series | None) -> Resumo:
    if valores is None or contagem == 0:
        return Resumo(count=contagem)
    return Resumo(
        count=contagem,
        sum=_numero(valores.sum()) if valores.notna().any() else None,
        mean=_numero(valores.mean()),
        min=_numero(valores.min()),
        max=_numero(valores.max()),
    )


def _numero(valor) -> float | None:
    if valor is None or pd.isna(valor):
        return None
    valor = float(valor)
    return None if math.isinf(valor) else valor


def _por_periodo(coluna: pd.Series, valores, intervalo: Intervalo) -> list[Grupo]:
    inicios = coluna.dt.to_period(FREQUENCIA[intervalo]).dt.start_time
    tabela = _tabela(inicios, valores).sort_index()
    if len(tabela) > MAX_PERIODOS:
        raise ConsultaInvalida(
            f"São {len(tabela)} períodos: escolha um intervalo maior (máximo {MAX_PERIODOS})."
        )
    return _grupos(tabela, chave=lambda inicio: inicio.date().isoformat())


def _por_categoria(coluna: pd.Series, valores, limite: int):
    rotulos = como_texto(coluna).fillna(VAZIO)
    tabela = _tabela(rotulos, valores)
    # Maiores primeiro: pela soma da medida, ou pela contagem se não houver medida.
    ordem = "sum" if valores is not None else "count"
    tabela = tabela.sort_values(ordem, ascending=False, na_position="last", kind="mergesort")
    principais = tabela.head(limite)
    grupos = _grupos(principais, chave=str)
    if len(tabela) <= limite:
        return grupos, None
    resto = ~rotulos.isin(principais.index)
    return grupos, _resumo(int(resto.sum()), valores[resto] if valores is not None else None)


def _tabela(chaves: pd.Series, valores: pd.Series | None) -> pd.DataFrame:
    """Uma linha por grupo, com count/sum/mean/min/max calculados de uma vez pelo pandas."""
    tabela = pd.DataFrame({"count": chaves.groupby(chaves).size()})
    if valores is None:
        return tabela
    por_grupo = valores.groupby(chaves)
    tabela["sum"] = por_grupo.sum(min_count=1)  # grupo sem nenhum valor: vazio, não zero
    tabela["mean"] = por_grupo.mean()
    tabela["min"] = por_grupo.min()
    tabela["max"] = por_grupo.max()
    return tabela


def _grupos(tabela: pd.DataFrame, chave) -> list[Grupo]:
    return [
        Grupo(
            key=chave(indice),
            **{k: _numero(v) for k, v in linha.items() if k != "count"},
            count=int(linha["count"]),
        )
        for indice, linha in tabela.iterrows()
    ]
