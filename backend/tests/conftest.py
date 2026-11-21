from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.shared.config import Settings, get_settings

VENDAS_CSV = (
    "data;filial;produto;quantidade;receita\n"
    "05/01/2026;São Paulo;Café;3;45,50\n"
    "06/01/2026;São Paulo;Pão;10;20\n"
    "07/01/2026;Recife;Café;1;15\n"
    "08/01/2026;Recife;Bolo;2;\n"
).encode("latin-1")


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(storage_dir=tmp_path / "storage", max_upload_mb=1)


@pytest.fixture
def client(settings: Settings):
    app.dependency_overrides[get_settings] = lambda: settings
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def enviar(client: TestClient, nome: str, conteudo: bytes, **form):
    return client.post("/api/datasets/upload", files={"file": (nome, conteudo)}, data=form)


@pytest.fixture
def dataset_vendas(client: TestClient) -> dict:
    """Um dataset de vendas já importado (4 linhas, 5 colunas)."""
    resposta = enviar(client, "vendas.csv", VENDAS_CSV, description="Teste")
    assert resposta.status_code == 201, resposta.text
    return resposta.json()
