"""Catálogo na tabela ``datasets`` de um Postgres (ver backend/migrations/).

SQL padrão: roda no Supabase e em qualquer outro Postgres.
"""

from typing import Any

from app.features.datasets.errors import DatasetNaoEncontrado
from app.features.datasets.models import DatasetMeta
from app.shared.banco.conexao import conectar

# Nome no modelo (Python/JSON) -> nome da coluna no banco.
COLUNAS = {
    "id": "id",
    "name": "name",
    "description": "description",
    "original_filename": "original_filename",
    "imported_at": "imported_at",
    "rows": "row_count",
    "columns": "column_count",
    "size_bytes": "size_bytes",
    "status": "status",
    "separator": "csv_separator",
    "encoding": "csv_encoding",
}
SELECT = "select " + ", ".join(f"{coluna} as {campo}" for campo, coluna in COLUNAS.items())
INSERT = (
    f"insert into datasets ({', '.join(COLUNAS.values())}) "
    f"values ({', '.join(f'%({campo})s' for campo in COLUNAS)})"
)


class CatalogoPostgres:
    def __init__(self, database_url: str):
        self._database_url = database_url

    def _executar(self, sql: str, parametros: dict[str, Any] | None = None):
        with conectar(self._database_url) as conexao:
            cursor = conexao.execute(sql, parametros)
            return cursor.fetchall() if cursor.description else cursor.rowcount

    def adicionar(self, meta: DatasetMeta) -> None:
        self._executar(INSERT, meta.model_dump(include=set(COLUNAS), by_alias=False))

    def listar(self) -> list[DatasetMeta]:
        linhas = self._executar(f"{SELECT} from datasets order by imported_at desc")
        return [DatasetMeta.model_validate(linha) for linha in linhas]

    def obter(self, dataset_id: str) -> DatasetMeta:
        linhas = self._executar(f"{SELECT} from datasets where id = %(id)s", {"id": dataset_id})
        if not linhas:
            raise DatasetNaoEncontrado(dataset_id)
        return DatasetMeta.model_validate(linhas[0])

    def remover(self, dataset_id: str) -> None:
        apagadas = self._executar("delete from datasets where id = %(id)s", {"id": dataset_id})
        if apagadas == 0:
            raise DatasetNaoEncontrado(dataset_id)
