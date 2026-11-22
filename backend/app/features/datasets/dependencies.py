"""Monta o repositório conforme a configuração e o injeta nas rotas.

Os testes trocam as Settings via app.dependency_overrides.
"""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.features.datasets.catalogo import criar_catalogo
from app.features.datasets.repository import DatasetRepository
from app.shared.arquivos import criar_armazenamento
from app.shared.config import S3Config, Settings, get_settings


@lru_cache
def _montar_repositorio(
    storage_dir: Path, database_url: str | None, s3: S3Config | None
) -> DatasetRepository:
    # Um repositório por configuração: o cache de DataFrames é compartilhado entre requisições.
    return DatasetRepository(
        catalogo=criar_catalogo(database_url, storage_dir / "datasets"),
        arquivos=criar_armazenamento(s3, storage_dir),
    )


def get_repositorio(settings: Annotated[Settings, Depends(get_settings)]) -> DatasetRepository:
    return _montar_repositorio(settings.storage_dir.resolve(), settings.database_url, settings.s3)


RepositorioDep = Annotated[DatasetRepository, Depends(get_repositorio)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
