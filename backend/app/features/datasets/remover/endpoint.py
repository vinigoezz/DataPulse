"""DELETE /api/datasets/{id}: apaga o dataset e seus dados (204, ou 404 se não existir)."""

from fastapi import APIRouter, Response, status

from app.features.datasets.dependencies import RepositorioDep

router = APIRouter()


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_dataset(dataset_id: str, repositorio: RepositorioDep) -> Response:
    repositorio.remover(dataset_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
