"""Arquivos num bucket compatível com S3 (Supabase Storage, AWS S3, Cloudflare R2, MinIO).

Trocar de provedor é trocar as variáveis DATAPULSE_S3_*: o código é o mesmo.
"""

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.shared.arquivos.porta import ArquivoAusente
from app.shared.config import S3Config

CODIGOS_DE_AUSENCIA = {"NoSuchKey", "404", "NotFound", "NoSuchBucket"}


class BucketS3:
    def __init__(self, config: S3Config):
        self.bucket = config.bucket
        self._cliente = boto3.client(
            "s3",
            endpoint_url=config.endpoint,
            region_name=config.region,
            aws_access_key_id=config.access_key,
            aws_secret_access_key=config.secret_key,
            # "path" (endpoint/bucket/chave) funciona em todos; o Supabase exige.
            config=Config(s3={"addressing_style": "path"}, retries={"mode": "standard"}),
        )

    def guardar(self, chave: str, dados: bytes) -> None:
        self._cliente.put_object(Bucket=self.bucket, Key=chave, Body=dados)

    def ler(self, chave: str) -> bytes:
        try:
            resposta = self._cliente.get_object(Bucket=self.bucket, Key=chave)
        except ClientError as erro:
            if _codigo(erro) in CODIGOS_DE_AUSENCIA:
                raise ArquivoAusente(chave) from erro
            raise
        return resposta["Body"].read()

    def apagar(self, chave: str) -> None:
        self._cliente.delete_object(Bucket=self.bucket, Key=chave)

    def garantir_bucket(self) -> bool:
        """Cria o bucket (privado) se ainda não existir. Devolve True se criou."""
        try:
            self._cliente.head_bucket(Bucket=self.bucket)
            return False
        except ClientError as erro:
            if _codigo(erro) not in CODIGOS_DE_AUSENCIA:
                raise
        self._cliente.create_bucket(Bucket=self.bucket)
        return True


def _codigo(erro: ClientError) -> str:
    return str(erro.response.get("Error", {}).get("Code", ""))
