"""Migrações: arquivos .sql numerados em backend/migrations/, aplicados em ordem e uma vez só.

A tabela ``schema_migrations`` lembra quais já rodaram. É SQL puro, sem ferramenta de
nenhum provedor: o mesmo comando monta o banco no Supabase, num Postgres local ou em outro.
"""

from pathlib import Path

from app.shared.banco.conexao import conectar

PASTA_MIGRACOES = Path(__file__).resolve().parents[3] / "migrations"

CRIAR_CONTROLE = """
create table if not exists schema_migrations (
    nome        text primary key,
    aplicada_em timestamptz not null default now()
);
alter table schema_migrations enable row level security;
"""


def pendentes(aplicadas: set[str], pasta: Path = PASTA_MIGRACOES) -> list[Path]:
    return [arquivo for arquivo in sorted(pasta.glob("*.sql")) if arquivo.name not in aplicadas]


def aplicar_migracoes(database_url: str, pasta: Path = PASTA_MIGRACOES) -> list[str]:
    """Aplica o que falta, tudo numa transação: ou entra tudo, ou nada. Devolve os nomes."""
    with conectar(database_url) as conexao:
        conexao.execute(CRIAR_CONTROLE)
        aplicadas = {
            linha["nome"] for linha in conexao.execute("select nome from schema_migrations")
        }
        novas = pendentes(aplicadas, pasta)
        for arquivo in novas:
            conexao.execute(arquivo.read_text(encoding="utf-8"))
            conexao.execute("insert into schema_migrations (nome) values (%s)", (arquivo.name,))
    return [arquivo.name for arquivo in novas]
