"""Dependências injetadas nas rotas (sobrescrevíveis nos testes via app.dependency_overrides)."""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.datasets import DatasetService
from app.storage.repository import DatasetRepository


@lru_cache
def _repositorio(storage_dir: Path) -> DatasetRepository:
    # Um repositório por pasta: o cache de DataFrames é compartilhado entre requisições.
    return DatasetRepository(storage_dir)


def get_dataset_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> DatasetService:
    return DatasetService(_repositorio(settings.storage_dir.resolve()), settings)


DatasetServiceDep = Annotated[DatasetService, Depends(get_dataset_service)]
