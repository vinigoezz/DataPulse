"""Abre conexões com o Postgres a partir de um único endereço (DATAPULSE_DATABASE_URL)."""

from urllib.parse import urlsplit

import psycopg
from psycopg.rows import dict_row


def conectar(database_url: str) -> psycopg.Connection:
    # prepare_threshold=None desliga "prepared statements", que os poolers de conexão
    # (como o do Supabase no modo transação) não suportam. Não muda nada nos outros.
    return psycopg.connect(database_url, row_factory=dict_row, prepare_threshold=None)


def problema_no_endereco(database_url: str) -> str | None:
    """Explica, sem repetir a senha, o que falta num endereço de banco mal copiado."""
    if any(caractere.isspace() for caractere in database_url):
        return (
            "Ele tem espaço ou quebra de linha no meio: provavelmente foi colada mais de uma "
            "linha. O valor deve ser uma linha só, terminando em /postgres."
        )
    if not database_url.startswith(("postgresql://", "postgres://")):
        return "Ele precisa começar com postgresql://"
    if "@" not in database_url:
        return (
            "Falta o final com o servidor (ex.: ...@servidor:5432/postgres). "
            "Copie a linha inteira do painel e troque só a parte da senha."
        )
    servidor = urlsplit(database_url).hostname
    if not servidor or "." not in servidor:
        return "Não encontrei o endereço do servidor depois do @."
    return None
