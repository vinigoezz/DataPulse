"""GET /api/datasets/{id}/rows: as linhas do dataset, uma página por vez."""

from typing import Annotated, Any

from fastapi import APIRouter, Query

from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.linhas.paginacao import paginar
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
) -> PaginatedRows:
    dados = repositorio.carregar_dados(dataset_id)
    return PaginatedRows(
        rows=paginar(dados, page, page_size), total=len(dados), page=page, page_size=page_size
    )
