"""O fluxo inteiro (importar, listar, linhas, remover) com Postgres + S3 no lugar das pastas."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.shared.banco.conexao import conectar
from app.shared.config import Settings, get_settings
from tests.conftest import VENDAS_CSV, enviar


@pytest.fixture
def client_na_nuvem(tmp_path, database_url_de_teste, s3_de_teste):
    with conectar(database_url_de_teste) as conexao:
        conexao.execute("delete from datasets")
    settings = Settings(
        storage_dir=tmp_path / "nao-usar",
        database_url=database_url_de_teste,
        s3=s3_de_teste,
        max_upload_mb=1,
    )
    app.dependency_overrides[get_settings] = lambda: settings
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_fluxo_completo(client_na_nuvem, tmp_path):
    criado = enviar(client_na_nuvem, "vendas.csv", VENDAS_CSV).json()

    assert [d["id"] for d in client_na_nuvem.get("/api/datasets").json()] == [criado["id"]]
    linhas = client_na_nuvem.get(f"/api/datasets/{criado['id']}/rows").json()
    assert linhas["total"] == 4

    assert client_na_nuvem.delete(f"/api/datasets/{criado['id']}").status_code == 204
    assert client_na_nuvem.get(f"/api/datasets/{criado['id']}").status_code == 404
    # Nada foi gravado no disco: tudo foi para o banco e o bucket.
    assert not (tmp_path / "nao-usar").exists()
