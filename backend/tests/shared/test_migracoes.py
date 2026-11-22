from app.shared.banco.conexao import conectar, problema_no_endereco
from app.shared.banco.migracoes import PASTA_MIGRACOES, aplicar_migracoes, pendentes


def test_migracoes_ficam_em_ordem_e_pulam_as_aplicadas(tmp_path):
    for nome in ["0002_b.sql", "0001_a.sql", "0010_c.sql", "leia-me.txt"]:
        (tmp_path / nome).write_text("select 1;")
    assert [p.name for p in pendentes(set(), tmp_path)] == [
        "0001_a.sql",
        "0002_b.sql",
        "0010_c.sql",
    ]
    assert [p.name for p in pendentes({"0001_a.sql"}, tmp_path)] == ["0002_b.sql", "0010_c.sql"]


def test_pasta_do_projeto_tem_migracoes_numeradas():
    nomes = [p.name for p in pendentes(set())]
    assert nomes and nomes[0] == "0001_criar_datasets.sql"
    assert PASTA_MIGRACOES.name == "migrations"


def test_aplicar_de_novo_nao_faz_nada(database_url_de_teste):
    # A fixture já aplicou tudo; a segunda vez não tem pendências.
    assert aplicar_migracoes(database_url_de_teste) == []
    with conectar(database_url_de_teste) as conexao:
        linha = conexao.execute("select count(*) as n from schema_migrations").fetchone()
    assert linha is not None and linha["n"] == len(pendentes(set()))


def test_endereco_cortado_explica_o_problema_sem_mostrar_a_senha():
    problema = problema_no_endereco("postgresql://postgres.abc:senhaSecreta")
    assert problema is not None and "servidor" in problema
    assert "senhaSecreta" not in problema


def test_endereco_completo_nao_tem_problema():
    url = "postgresql://postgres.abc:senha@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
    assert problema_no_endereco(url) is None
    assert problema_no_endereco("mysql://x@y.com/db") is not None


def test_endereco_com_mais_de_uma_linha_explica_o_problema():
    colado = "postgresql://u:senha@aws-0-us-east-2.pooler.supabase.com:5432/postgres\nDATAPULSE_S3_BUCKET=x"
    problema = problema_no_endereco(colado)
    assert problema is not None and "mais de uma" in problema
    assert "u:senha" not in problema
