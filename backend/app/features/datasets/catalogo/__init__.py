"""Catálogo de datasets: escolhe Postgres (se configurado) ou arquivos JSON locais."""

from pathlib import Path

from app.features.datasets.catalogo.porta import CatalogoDeDatasets

__all__ = ["CatalogoDeDatasets", "criar_catalogo"]


def criar_catalogo(database_url: str | None, pasta_local: Path) -> CatalogoDeDatasets:
    if database_url is None:
        from app.features.datasets.catalogo.arquivos_json import CatalogoEmArquivos

        return CatalogoEmArquivos(pasta_local)

    from app.features.datasets.catalogo.postgres import CatalogoPostgres

    return CatalogoPostgres(database_url)
