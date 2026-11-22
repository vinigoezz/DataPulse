"""Persistência dos datasets, juntando duas peças trocáveis:

- o **catálogo** (metadados): JSON local ou Postgres;
- os **arquivos** (os dados em Parquet): pasta local ou bucket S3.

As fatias só falam com o DatasetRepository e não sabem qual peça está ligada.
"""

import io
import re
import threading
from collections import OrderedDict

import pandas as pd

from app.features.datasets.catalogo import CatalogoDeDatasets
from app.features.datasets.errors import DatasetNaoEncontrado
from app.features.datasets.models import DatasetMeta
from app.shared.arquivos import ArmazenamentoDeArquivos, ArquivoAusente

ID_VALIDO = re.compile(r"^[a-z0-9-]{1,64}$")
# Quantos DataFrames ficam em memória para paginação/estatísticas rápidas.
CACHE_MAX = 4


def chave_dos_dados(dataset_id: str) -> str:
    return f"datasets/{dataset_id}/data.parquet"


class DatasetRepository:
    def __init__(self, catalogo: CatalogoDeDatasets, arquivos: ArmazenamentoDeArquivos):
        self.catalogo = catalogo
        self.arquivos = arquivos
        self._cache: OrderedDict[str, pd.DataFrame] = OrderedDict()
        self._lock = threading.Lock()

    @staticmethod
    def _validar(dataset_id: str) -> str:
        # O id vem da URL: validar impede montar chaves estranhas no armazenamento.
        if not ID_VALIDO.match(dataset_id):
            raise DatasetNaoEncontrado(dataset_id)
        return dataset_id

    def salvar(self, meta: DatasetMeta, df: pd.DataFrame) -> None:
        self._validar(meta.id)
        buffer = io.BytesIO()
        df.to_parquet(buffer, index=False)
        # Primeiro os dados, depois o catálogo: quem lista nunca vê um dataset sem dados.
        self.arquivos.guardar(chave_dos_dados(meta.id), buffer.getvalue())
        try:
            self.catalogo.adicionar(meta)
        except Exception:
            self.arquivos.apagar(chave_dos_dados(meta.id))
            raise

    def listar(self) -> list[DatasetMeta]:
        return self.catalogo.listar()

    def obter(self, dataset_id: str) -> DatasetMeta:
        return self.catalogo.obter(self._validar(dataset_id))

    def carregar_dados(self, dataset_id: str) -> pd.DataFrame:
        self._validar(dataset_id)
        with self._lock:
            if dataset_id in self._cache:
                self._cache.move_to_end(dataset_id)
                return self._cache[dataset_id]
        try:
            conteudo = self.arquivos.ler(chave_dos_dados(dataset_id))
        except ArquivoAusente as erro:
            raise DatasetNaoEncontrado(dataset_id) from erro
        df = pd.read_parquet(io.BytesIO(conteudo))
        with self._lock:
            self._cache[dataset_id] = df
            while len(self._cache) > CACHE_MAX:
                self._cache.popitem(last=False)
        return df

    def remover(self, dataset_id: str) -> None:
        # Primeiro o catálogo (some da lista na hora), depois os dados.
        self.catalogo.remover(self._validar(dataset_id))
        with self._lock:
            self._cache.pop(dataset_id, None)
        self.arquivos.apagar(chave_dos_dados(dataset_id))
