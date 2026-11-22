"""Contrato do catálogo de datasets: JSON local e Postgres se comportam igual."""

from datetime import UTC, datetime, timedelta

import pytest

from app.features.datasets.catalogo import criar_catalogo
from app.features.datasets.catalogo.arquivos_json import CatalogoEmArquivos
from app.features.datasets.catalogo.postgres import CatalogoPostgres
from app.features.datasets.errors import DatasetNaoEncontrado
from app.features.datasets.models import DatasetMeta
from app.shared.banco.conexao import conectar

AGORA = datetime(2026, 11, 21, 12, 0, tzinfo=UTC)


def meta(dataset_id: str, horas_atras: int = 0, **extra) -> DatasetMeta:
    return DatasetMeta(
        id=dataset_id,
        name=f"{dataset_id}.csv",
        imported_at=AGORA - timedelta(hours=horas_atras),
        rows=4,
        columns=5,
        size_bytes=123,
        status="processado",
        original_filename=f"{dataset_id}.csv",
        separator=";",
        encoding="latin-1",
        **extra,
    )


@pytest.fixture(params=["arquivos_json", "postgres"])
def catalogo(request, tmp_path):
    if request.param == "arquivos_json":
        return CatalogoEmArquivos(tmp_path)
    url = request.getfixturevalue("database_url_de_teste")
    with conectar(url) as conexao:
        conexao.execute("delete from datasets")
    return CatalogoPostgres(url)


def test_adiciona_e_obtem_com_todos_os_campos(catalogo):
    original = meta("ds-1", description="Vendas de janeiro")
    catalogo.adicionar(original)
    assert catalogo.obter("ds-1") == original


def test_lista_do_mais_recente_para_o_mais_antigo(catalogo):
    catalogo.adicionar(meta("ds-antigo", horas_atras=5))
    catalogo.adicionar(meta("ds-novo", horas_atras=1))
    catalogo.adicionar(meta("ds-meio", horas_atras=3))
    assert [m.id for m in catalogo.listar()] == ["ds-novo", "ds-meio", "ds-antigo"]


def test_lista_vazia(catalogo):
    assert catalogo.listar() == []


def test_remove(catalogo):
    catalogo.adicionar(meta("ds-1"))
    catalogo.remover("ds-1")
    assert catalogo.listar() == []
    with pytest.raises(DatasetNaoEncontrado):
        catalogo.obter("ds-1")


def test_inexistente_avisa_nao_encontrado(catalogo):
    with pytest.raises(DatasetNaoEncontrado):
        catalogo.obter("ds-x")
    with pytest.raises(DatasetNaoEncontrado):
        catalogo.remover("ds-x")


def test_escolhe_pela_configuracao(tmp_path):
    assert isinstance(criar_catalogo(None, tmp_path), CatalogoEmArquivos)
    # Só monta: a conexão com o banco acontece no primeiro uso.
    assert isinstance(criar_catalogo("postgresql://u:s@host/db", tmp_path), CatalogoPostgres)


def test_data_sem_fuso_vira_utc():
    dados = meta("ds-1").model_dump(by_alias=False) | {"imported_at": datetime(2026, 1, 1, 10, 0)}
    antigo = DatasetMeta.model_validate(dados)
    assert antigo.imported_at == datetime(2026, 1, 1, 10, 0, tzinfo=UTC)
