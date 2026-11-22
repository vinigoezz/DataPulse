"""Prepara a nuvem configurada em backend/.env: cria as tabelas que faltam e o bucket.

Uso: ``make migrar`` (ou ``python -m app.preparar`` dentro de backend/).
Pode rodar quantas vezes quiser: só faz o que ainda não foi feito.
"""

import sys

import psycopg

from app.shared.arquivos.bucket_s3 import BucketS3
from app.shared.banco.conexao import problema_no_endereco
from app.shared.banco.migracoes import aplicar_migracoes
from app.shared.config import get_settings


def preparar_banco(database_url: str | None) -> None:
    if database_url is None:
        print("Banco: DATAPULSE_DATABASE_URL não definida, usando arquivos locais.")
        return
    if problema := problema_no_endereco(database_url):
        sys.exit(f"Banco: DATAPULSE_DATABASE_URL inválida. {problema}")
    try:
        novas = aplicar_migracoes(database_url)
    except psycopg.OperationalError as erro:
        # A mensagem do driver nunca inclui a senha, mas pode ser longa: fica só a 1ª linha.
        sys.exit(f"Banco: não consegui conectar. {str(erro).splitlines()[0]}")
    print(f"Banco: {len(novas)} migração(ões) aplicada(s) {novas}" if novas else "Banco: em dia.")


def preparar_arquivos(settings_s3) -> None:
    if settings_s3 is None:
        print("Arquivos: DATAPULSE_S3_BUCKET não definida, usando a pasta local.")
        return
    criado = BucketS3(settings_s3).garantir_bucket()
    print(f"Arquivos: bucket '{settings_s3.bucket}' " + ("criado." if criado else "já existe."))


def main() -> None:
    settings = get_settings()
    preparar_banco(settings.database_url)
    preparar_arquivos(settings.s3)


if __name__ == "__main__":
    main()
