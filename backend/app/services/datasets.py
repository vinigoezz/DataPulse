"""Casos de uso de datasets: importar, listar, paginar linhas e calcular estatísticas.

Orquestra ingestion (leitura do arquivo), profiling (tipos/estatísticas) e o
repositório (persistência). Não conhece HTTP: recebe streams e devolve schemas.
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import IO

from app.core.config import Settings
from app.core.errors import ArquivoInvalido, ArquivoMuitoGrande
from app.schemas.datasets import ColumnStats, Dataset, DatasetMeta, PaginatedRows
from app.services import ingestion, profiling
from app.storage.repository import DatasetRepository

BLOCO = 1024 * 1024


class DatasetService:
    def __init__(self, repo: DatasetRepository, settings: Settings):
        self.repo = repo
        self.settings = settings

    def importar(
        self,
        arquivo: IO[bytes],
        nome_arquivo: str,
        descricao: str = "",
        separador: str | None = None,
        encoding: str | None = None,
    ) -> Dataset:
        if not ingestion.extensao_valida(nome_arquivo):
            raise ArquivoInvalido("Formato não suportado. Envie um arquivo .csv, .zip ou .gz.")

        dataset_id = f"ds-{uuid.uuid4().hex[:12]}"
        temporario = self.repo.tmp_dir / f"{dataset_id}.upload"
        try:
            tamanho = self._copiar_com_limite(arquivo, temporario)
            if tamanho == 0:
                raise ArquivoInvalido("O arquivo está vazio.")
            df, separador, encoding = ingestion.ler_csv(
                temporario, nome_arquivo, separador, encoding
            )
        finally:
            temporario.unlink(missing_ok=True)

        if df.empty:
            raise ArquivoInvalido("O arquivo não contém dados.")

        meta = DatasetMeta(
            id=dataset_id,
            name=Path(nome_arquivo).name,
            imported_at=datetime.now().replace(microsecond=0),
            rows=len(df),
            columns=len(df.columns),
            size_bytes=tamanho,
            # Processamento síncrono por enquanto; "processando"/"pendente" ficam para a fila.
            status="processado",
            description=descricao,
            original_filename=nome_arquivo,
            separator=separador,
            encoding=encoding,
        )
        self.repo.salvar(meta, df)
        return Dataset.model_validate(meta.model_dump())

    def _copiar_com_limite(self, origem: IO[bytes], destino: Path) -> int:
        limite = self.settings.max_upload_bytes
        total = 0
        with open(destino, "wb") as saida:
            while bloco := origem.read(BLOCO):
                total += len(bloco)
                if total > limite:
                    raise ArquivoMuitoGrande(self.settings.max_upload_mb)
                saida.write(bloco)
        return total

    def listar(self) -> list[Dataset]:
        return [Dataset.model_validate(m.model_dump()) for m in self.repo.listar()]

    def obter(self, dataset_id: str) -> Dataset:
        return Dataset.model_validate(self.repo.obter(dataset_id).model_dump())

    def remover(self, dataset_id: str) -> None:
        self.repo.remover(dataset_id)

    def linhas(self, dataset_id: str, page: int, page_size: int) -> PaginatedRows:
        df = self.repo.carregar_dados(dataset_id)
        inicio = (page - 1) * page_size
        pagina = df.iloc[inicio : inicio + page_size]
        # to_json resolve NaN -> null e datas -> ISO 8601 de uma vez.
        rows = json.loads(pagina.to_json(orient="records", date_format="iso"))
        return PaginatedRows(rows=rows, total=len(df), page=page, page_size=page_size)

    def estatisticas(self, dataset_id: str) -> list[ColumnStats]:
        return profiling.estatisticas(self.repo.carregar_dados(dataset_id))
