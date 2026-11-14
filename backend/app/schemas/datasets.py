"""Contratos da API. Espelham Frontend/src/types/index.ts (JSON em camelCase)."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

DatasetStatus = Literal["processado", "processando", "erro", "pendente"]
ColumnType = Literal["texto", "número", "moeda", "data", "categoria"]


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, serialize_by_alias=True
    )


class Dataset(ApiModel):
    id: str
    name: str
    imported_at: datetime
    rows: int
    columns: int
    size_bytes: int
    status: DatasetStatus
    description: str = ""


class DatasetMeta(Dataset):
    """O que fica salvo em disco: o Dataset público mais detalhes de origem."""

    original_filename: str
    separator: str
    encoding: str


class ColumnSchema(ApiModel):
    key: str
    label: str
    type: ColumnType


class ColumnStats(ColumnSchema):
    nulls: int
    distinct: int
    min: float | None = None
    max: float | None = None
    mean: float | None = None


class PaginatedRows(ApiModel):
    rows: list[dict[str, Any]]
    total: int
    page: int
    page_size: int


class Health(ApiModel):
    status: Literal["ok"]
    version: str
