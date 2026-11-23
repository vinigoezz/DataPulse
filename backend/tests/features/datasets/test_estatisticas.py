import pandas as pd
import pytest

from app.features.datasets.estatisticas.perfil import inferir_tipo


def test_inferir_tipo():
    assert inferir_tipo(pd.Series([1.5, 2.0], name="receita")) == "moeda"
    assert inferir_tipo(pd.Series([1, 2], name="quantidade")) == "número"
    assert inferir_tipo(pd.Series(pd.to_datetime(["2026-01-01"]), name="d")) == "data"
    assert inferir_tipo(pd.Series(["SP", "RJ", "SP", "RJ"], name="uf")) == "categoria"
    assert inferir_tipo(pd.Series(["Ana", "Bia", "Caio"], name="nome")) == "texto"
    assert inferir_tipo(pd.Series([True, False], name="ativo")) == "categoria"


def test_endpoint_de_estatisticas(client, dataset_vendas):
    resposta = client.get(f"/api/datasets/{dataset_vendas['id']}/stats")
    stats = {s["key"]: s for s in resposta.json()}
    assert stats["data"]["type"] == "data"
    assert stats["filial"]["type"] == "categoria"
    assert stats["quantidade"]["type"] == "número"
    assert stats["quantidade"]["mean"] == 4
    # "45,50" (vírgula decimal) vira número; o nome "receita" faz a coluna ser moeda.
    assert stats["receita"]["type"] == "moeda"
    assert stats["receita"]["nulls"] == 1
    assert (stats["receita"]["min"], stats["receita"]["max"]) == (15, 45.5)
    assert stats["receita"]["mean"] == pytest.approx((45.5 + 20 + 15) / 3)


def test_estatisticas_de_dataset_inexistente(client):
    assert client.get("/api/datasets/ds-naoexiste/stats").status_code == 404


def test_categorias_trazem_as_opcoes_de_filtro(client, dataset_vendas):
    resposta = client.get(f"/api/datasets/{dataset_vendas['id']}/stats")
    stats = {s["key"]: s for s in resposta.json()}
    assert stats["filial"]["values"] == ["Recife", "São Paulo"]
    assert stats["quantidade"]["values"] is None
