"""Modelos usados por várias fatias de datasets.

Espelham Frontend/src/types/index.ts (o JSON sai em camelCase): ao mudar um, mude o outro.
Contratos usados por uma fatia só ficam dentro dela (ex.: estatisticas/endpoint.py).
"""

from datetime import datetime
from typing import Literal

from app.shared.api_model import ApiModel

DatasetStatus = Literal["processado", "processando", "erro", "pendente"]


class Dataset(ApiModel):
    """O que a API mostra sobre um dataset."""

    id: str
    name: str
    imported_at: datetime
    rows: int
    columns: int
    size_bytes: int
    status: DatasetStatus
    description: str = ""


class DatasetMeta(Dataset):
    """O que fica salvo: o Dataset público mais detalhes de como o arquivo foi lido."""

    original_filename: str
    separator: str
    encoding: str

    def publico(self) -> Dataset:
        return Dataset.model_validate(self.model_dump(include=set(Dataset.model_fields)))
