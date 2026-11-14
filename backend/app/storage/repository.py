"""Persistência dos datasets em disco.

Cada dataset vive em ``<storage_dir>/datasets/<id>/`` com:
- ``data.parquet``: os dados já tratados (tipos e datas preservados, leitura rápida);
- ``meta.json``: os metadados (DatasetMeta).

A interface é pequena de propósito: trocar por banco/objeto (Postgres, S3) depois
só exige outra implementação com os mesmos métodos.
"""

import re
import shutil
import threading
from collections import OrderedDict
from pathlib import Path

import pandas as pd

from app.core.errors import DatasetNaoEncontrado
from app.schemas.datasets import DatasetMeta

ID_VALIDO = re.compile(r"^[a-z0-9-]{1,64}$")
# Quantos DataFrames ficam em memória para paginação/estatísticas rápidas.
CACHE_MAX = 4


class DatasetRepository:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.datasets_dir = base_dir / "datasets"
        self.tmp_dir = base_dir / "tmp"
        self.datasets_dir.mkdir(parents=True, exist_ok=True)
        self.tmp_dir.mkdir(parents=True, exist_ok=True)
        self._cache: OrderedDict[str, pd.DataFrame] = OrderedDict()
        self._lock = threading.Lock()

    def _pasta(self, dataset_id: str) -> Path:
        # O id vem da URL: validar impede acessar caminhos fora do storage.
        if not ID_VALIDO.match(dataset_id):
            raise DatasetNaoEncontrado(dataset_id)
        return self.datasets_dir / dataset_id

    def salvar(self, meta: DatasetMeta, df: pd.DataFrame) -> None:
        destino = self._pasta(meta.id)
        # Escreve numa pasta temporária e renomeia: quem lista nunca vê um dataset pela metade.
        parcial = self.tmp_dir / f"{meta.id}.partial"
        shutil.rmtree(parcial, ignore_errors=True)
        parcial.mkdir(parents=True)
        df.to_parquet(parcial / "data.parquet", index=False)
        (parcial / "meta.json").write_text(meta.model_dump_json(indent=2), encoding="utf-8")
        parcial.rename(destino)

    def listar(self) -> list[DatasetMeta]:
        metas = [
            DatasetMeta.model_validate_json(arquivo.read_text(encoding="utf-8"))
            for arquivo in self.datasets_dir.glob("*/meta.json")
        ]
        return sorted(metas, key=lambda m: m.imported_at, reverse=True)

    def obter(self, dataset_id: str) -> DatasetMeta:
        arquivo = self._pasta(dataset_id) / "meta.json"
        if not arquivo.exists():
            raise DatasetNaoEncontrado(dataset_id)
        return DatasetMeta.model_validate_json(arquivo.read_text(encoding="utf-8"))

    def carregar_dados(self, dataset_id: str) -> pd.DataFrame:
        with self._lock:
            if dataset_id in self._cache:
                self._cache.move_to_end(dataset_id)
                return self._cache[dataset_id]
        arquivo = self._pasta(dataset_id) / "data.parquet"
        if not arquivo.exists():
            raise DatasetNaoEncontrado(dataset_id)
        df = pd.read_parquet(arquivo)
        with self._lock:
            self._cache[dataset_id] = df
            while len(self._cache) > CACHE_MAX:
                self._cache.popitem(last=False)
        return df

    def remover(self, dataset_id: str) -> None:
        pasta = self._pasta(dataset_id)
        if not pasta.exists():
            raise DatasetNaoEncontrado(dataset_id)
        with self._lock:
            self._cache.pop(dataset_id, None)
        shutil.rmtree(pasta)
