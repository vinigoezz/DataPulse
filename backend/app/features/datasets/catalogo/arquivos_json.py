"""Catálogo em arquivos JSON (``<pasta>/<id>/meta.json``). Usado em desenvolvimento e nos testes."""

import os
from pathlib import Path

from app.features.datasets.errors import DatasetNaoEncontrado
from app.features.datasets.models import DatasetMeta


class CatalogoEmArquivos:
    def __init__(self, pasta: Path):
        self.pasta = pasta

    def _arquivo(self, dataset_id: str) -> Path:
        return self.pasta / dataset_id / "meta.json"

    def adicionar(self, meta: DatasetMeta) -> None:
        destino = self._arquivo(meta.id)
        destino.parent.mkdir(parents=True, exist_ok=True)
        parcial = destino.with_name("meta.json.parcial")
        parcial.write_text(meta.model_dump_json(indent=2), encoding="utf-8")
        os.replace(parcial, destino)

    def listar(self) -> list[DatasetMeta]:
        metas = [
            DatasetMeta.model_validate_json(arquivo.read_text(encoding="utf-8"))
            for arquivo in self.pasta.glob("*/meta.json")
        ]
        return sorted(metas, key=lambda meta: meta.imported_at, reverse=True)

    def obter(self, dataset_id: str) -> DatasetMeta:
        arquivo = self._arquivo(dataset_id)
        if not arquivo.exists():
            raise DatasetNaoEncontrado(dataset_id)
        return DatasetMeta.model_validate_json(arquivo.read_text(encoding="utf-8"))

    def remover(self, dataset_id: str) -> None:
        arquivo = self._arquivo(dataset_id)
        if not arquivo.exists():
            raise DatasetNaoEncontrado(dataset_id)
        arquivo.unlink()
