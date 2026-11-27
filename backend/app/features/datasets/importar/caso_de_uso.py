"""Importar um dataset: receber o arquivo, ler o CSV, montar os metadados e salvar.

Não conhece HTTP: recebe um stream de bytes e devolve o Dataset criado.
"""

import tempfile
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import IO

from app.features.datasets.errors import ArquivoInvalido, ArquivoMuitoGrande
from app.features.datasets.importar import leitura
from app.features.datasets.models import Dataset, DatasetMeta
from app.features.datasets.repository import DatasetRepository

TAMANHO_BLOCO = 1024 * 1024


@dataclass(frozen=True)
class PedidoDeImportacao:
    arquivo: IO[bytes]
    nome_arquivo: str
    descricao: str = ""
    separador: str | None = None  # detectado quando None
    encoding: str | None = None  # detectado quando None


def importar_dataset(
    pedido: PedidoDeImportacao, repositorio: DatasetRepository, limite_mb: int
) -> Dataset:
    if not leitura.extensao_valida(pedido.nome_arquivo):
        raise ArquivoInvalido(
            f"Formato não suportado. Envie um arquivo {leitura.FORMATOS_ACEITOS}."
        )

    dataset_id = _novo_id()
    # Pasta temporária do sistema: existe em qualquer hospedagem e some sozinha no fim.
    with tempfile.TemporaryDirectory(prefix="datapulse-") as pasta:
        temporario = Path(pasta) / "upload"
        tamanho = _copiar_com_limite(pedido.arquivo, temporario, limite_mb)
        if tamanho == 0:
            raise ArquivoInvalido("O arquivo está vazio.")
        dados, separador, encoding = leitura.ler_planilha(
            temporario, pedido.nome_arquivo, pedido.separador, pedido.encoding
        )

    if dados.empty:
        raise ArquivoInvalido("O arquivo não contém dados.")

    meta = DatasetMeta(
        id=dataset_id,
        name=Path(pedido.nome_arquivo).name,
        imported_at=datetime.now(UTC).replace(microsecond=0),
        rows=len(dados),
        columns=len(dados.columns),
        size_bytes=tamanho,
        # Processamento síncrono por enquanto: o dataset já nasce pronto.
        status="processado",
        description=pedido.descricao,
        original_filename=pedido.nome_arquivo,
        separator=separador,
        encoding=encoding,
    )
    repositorio.salvar(meta, dados)
    return meta.publico()


def _novo_id() -> str:
    return f"ds-{uuid.uuid4().hex[:12]}"


def _copiar_com_limite(origem: IO[bytes], destino: Path, limite_mb: int) -> int:
    """Copia o upload para o disco em blocos e para assim que passar do limite."""
    limite_bytes = limite_mb * 1024 * 1024
    total = 0
    with open(destino, "wb") as saida:
        while bloco := origem.read(TAMANHO_BLOCO):
            total += len(bloco)
            if total > limite_bytes:
                raise ArquivoMuitoGrande(limite_mb)
            saida.write(bloco)
    return total
