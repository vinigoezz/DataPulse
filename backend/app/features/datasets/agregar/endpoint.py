"""GET /api/datasets/{id}/aggregate: totais gerais, por período ou por categoria."""

from typing import Annotated

from fastapi import APIRouter, Query

from app.features.datasets.agregar.agregacao import (
    Agregacao,
    Intervalo,
    PedidoDeAgregacao,
    agregar,
)
from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.filtragem import ler_faixas, ler_filtros

router = APIRouter()


@router.get("/{dataset_id}/aggregate", response_model=Agregacao)
def agregar_dataset(
    dataset_id: str,
    repositorio: RepositorioDep,
    measure: Annotated[
        str | None, Query(description="Coluna numérica somada; sem ela, só contagem")
    ] = None,
    group_by: Annotated[
        str | None, Query(description="Coluna de data (períodos) ou de texto (categorias)")
    ] = None,
    interval: Intervalo = "mes",
    limit: Annotated[int, Query(ge=1, le=50, description="Categorias mostradas")] = 10,
    filters: Annotated[str | None, Query(description='Ex.: {"filial": "Recife"}')] = None,
    ranges: Annotated[str | None, Query(description='Ex.: {"data": {"min": "2026-01-01"}}')] = None,
) -> Agregacao:
    pedido = PedidoDeAgregacao(
        medida=measure or None,
        agrupar_por=group_by or None,
        intervalo=interval,
        limite=limit,
        filtros=ler_filtros(filters),
        faixas=ler_faixas(ranges),
    )
    return agregar(repositorio.carregar_dados(dataset_id), pedido)
