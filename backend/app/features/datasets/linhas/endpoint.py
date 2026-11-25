"""GET /api/datasets/{id}/rows: as linhas do dataset, com busca, filtros, ordenação e páginas."""

from typing import Annotated, Any

from fastapi import APIRouter, Query

from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.filtragem import ler_faixas, ler_filtros
from app.features.datasets.linhas.consulta import ConsultaDeLinhas, Ordem, consultar
from app.shared.api_model import ApiModel

router = APIRouter()

TAMANHO_PADRAO = 25
TAMANHO_MAXIMO = 1000


class PaginatedRows(ApiModel):
    rows: list[dict[str, Any]]
    total: int
    page: int
    page_size: int


@router.get("/{dataset_id}/rows", response_model=PaginatedRows)
def listar_linhas(
    dataset_id: str,
    repositorio: RepositorioDep,
    page: Annotated[int, Query(ge=1, description="Começa em 1")] = 1,
    page_size: Annotated[int, Query(ge=1, le=TAMANHO_MAXIMO)] = TAMANHO_PADRAO,
    search: Annotated[str, Query(description="Texto buscado em todas as colunas")] = "",
    filters: Annotated[
        str | None, Query(description='JSON com valores exatos, ex.: {"filial": "Recife"}')
    ] = None,
    ranges: Annotated[
        str | None,
        Query(description='JSON com faixas de número ou data, ex.: {"receita": {"min": 100}}'),
    ] = None,
    sort: Annotated[str | None, Query(description="Coluna usada na ordenação")] = None,
    order: Ordem = "asc",
) -> PaginatedRows:
    consulta = ConsultaDeLinhas(
        pagina=page,
        tamanho=page_size,
        busca=search,
        filtros=ler_filtros(filters),
        faixas=ler_faixas(ranges),
        ordenar_por=sort or None,
        ordem=order,
    )
    resultado = consultar(repositorio.carregar_dados(dataset_id), consulta)
    return PaginatedRows(
        rows=resultado.linhas, total=resultado.total, page=page, page_size=page_size
    )
