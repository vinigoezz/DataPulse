"""GET /api/datasets/{id}: os dados de um dataset (404 se não existir)."""

from fastapi import APIRouter

from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.models import Dataset

router = APIRouter()


@router.get("/{dataset_id}", response_model=Dataset)
def obter_dataset(dataset_id: str, repositorio: RepositorioDep) -> Dataset:
    return repositorio.obter(dataset_id).publico()
