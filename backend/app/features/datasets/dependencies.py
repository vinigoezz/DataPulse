"""Injeção do repositório nas rotas (os testes trocam as Settings via app.dependency_overrides)."""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.features.datasets.repository import DatasetRepository
from app.shared.config import Settings, get_settings


@lru_cache
def _repositorio_da_pasta(storage_dir: Path) -> DatasetRepository:
    # Um repositório por pasta: o cache de DataFrames é compartilhado entre requisições.
    return DatasetRepository(storage_dir)


def get_repositorio(settings: Annotated[Settings, Depends(get_settings)]) -> DatasetRepository:
    return _repositorio_da_pasta(settings.storage_dir.resolve())


RepositorioDep = Annotated[DatasetRepository, Depends(get_repositorio)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
