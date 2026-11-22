"""Armazenamento de arquivos: escolhe a implementação conforme a configuração."""

from pathlib import Path

from app.shared.arquivos.porta import ArmazenamentoDeArquivos, ArquivoAusente
from app.shared.config import S3Config

__all__ = ["ArmazenamentoDeArquivos", "ArquivoAusente", "criar_armazenamento"]


def criar_armazenamento(s3: S3Config | None, pasta_local: Path) -> ArmazenamentoDeArquivos:
    if s3 is None:
        from app.shared.arquivos.pasta_local import PastaLocal

        return PastaLocal(pasta_local)

    from app.shared.arquivos.bucket_s3 import BucketS3

    return BucketS3(s3)
