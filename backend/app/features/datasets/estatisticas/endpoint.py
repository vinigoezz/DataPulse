"""GET /api/datasets/{id}/stats: tipo e estatísticas de cada coluna."""

from fastapi import APIRouter

from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.estatisticas.perfil import ColumnStats, estatisticas

router = APIRouter()


@router.get("/{dataset_id}/stats", response_model=list[ColumnStats])
def estatisticas_das_colunas(dataset_id: str, repositorio: RepositorioDep) -> list[ColumnStats]:
    return estatisticas(repositorio.carregar_dados(dataset_id))
