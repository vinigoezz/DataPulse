"""Rotas de datasets. Contratos usados por Frontend/src/services/datasets.service.ts."""

from typing import Annotated

from fastapi import APIRouter, File, Form, Query, Response, UploadFile, status

from app.api.deps import DatasetServiceDep
from app.schemas.datasets import ColumnStats, Dataset, PaginatedRows

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("", response_model=list[Dataset])
def listar(service: DatasetServiceDep) -> list[Dataset]:
    return service.listar()


@router.post("/upload", response_model=Dataset, status_code=status.HTTP_201_CREATED)
def importar(
    service: DatasetServiceDep,
    file: Annotated[UploadFile, File(description="CSV, ou .zip/.gz com um único CSV")],
    description: Annotated[str, Form()] = "",
    separator: Annotated[str | None, Form(description="Detectado se omitido")] = None,
    encoding: Annotated[str | None, Form(description="Detectado se omitido")] = None,
) -> Dataset:
    return service.importar(
        file.file,
        file.filename or "arquivo.csv",
        descricao=description,
        separador=separator or None,
        encoding=encoding or None,
    )


@router.get("/{dataset_id}", response_model=Dataset)
def obter(dataset_id: str, service: DatasetServiceDep) -> Dataset:
    return service.obter(dataset_id)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(dataset_id: str, service: DatasetServiceDep) -> Response:
    service.remover(dataset_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{dataset_id}/rows", response_model=PaginatedRows)
def linhas(
    dataset_id: str,
    service: DatasetServiceDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=1000)] = 25,
) -> PaginatedRows:
    return service.linhas(dataset_id, page, page_size)


@router.get("/{dataset_id}/stats", response_model=list[ColumnStats])
def estatisticas(dataset_id: str, service: DatasetServiceDep) -> list[ColumnStats]:
    return service.estatisticas(dataset_id)
