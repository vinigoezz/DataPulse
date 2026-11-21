"""GET /api/datasets: todos os datasets, dos mais recentes para os mais antigos."""

from fastapi import APIRouter

from app.features.datasets.dependencies import RepositorioDep
from app.features.datasets.models import Dataset

router = APIRouter()


@router.get("", response_model=list[Dataset])
def listar_datasets(repositorio: RepositorioDep) -> list[Dataset]:
    return [meta.publico() for meta in repositorio.listar()]
