"""A "tomada" do catálogo: onde ficam os metadados (nome, linhas, colunas...) dos datasets."""

from typing import Protocol

from app.features.datasets.models import DatasetMeta


class CatalogoDeDatasets(Protocol):
    def adicionar(self, meta: DatasetMeta) -> None: ...

    def listar(self) -> list[DatasetMeta]:
        """Do mais recente para o mais antigo."""
        ...

    def obter(self, dataset_id: str) -> DatasetMeta:
        """Levanta DatasetNaoEncontrado se não existir."""
        ...

    def remover(self, dataset_id: str) -> None:
        """Levanta DatasetNaoEncontrado se não existir."""
        ...
