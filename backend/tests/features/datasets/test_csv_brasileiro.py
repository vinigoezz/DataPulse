"""Importação de um CSV no formato que o Excel brasileiro gera (latin-1, ";", R$, %, datas)."""

from pathlib import Path

import pytest

from tests.conftest import enviar

ARQUIVO = Path(__file__).resolve().parents[2] / "fixtures" / "vendas_brasil.csv"


@pytest.fixture
def importado(client) -> dict:
    resposta = enviar(client, ARQUIVO.name, ARQUIVO.read_bytes())
    assert resposta.status_code == 201, resposta.text
    return resposta.json()


@pytest.fixture
def stats(client, importado) -> dict:
    resposta = client.get(f"/api/datasets/{importado['id']}/stats")
    return {coluna["key"]: coluna for coluna in resposta.json()}


def test_cada_coluna_recebe_o_tipo_certo(stats):
    tipos = {coluna: s["type"] for coluna, s in stats.items()}
    assert tipos == {
        "Data da venda": "data",
        # Com só 5 linhas, poucos valores se repetem: ainda é "texto", não "categoria".
        "Filial": "texto",
        "Código": "texto",  # 00123 é código: nem número, nem data
        "CEP": "texto",
        "CPF do cliente": "texto",
        "Quantidade": "número",
        "Preço unitário": "moeda",
        "Total": "moeda",
        "Desconto": "percentual",
        "Avaliação": "número",
    }


def test_estatisticas_usam_os_valores_convertidos(stats):
    assert (stats["Total"]["min"], stats["Total"]["max"]) == (15, 2500)
    assert stats["Total"]["mean"] == pytest.approx((45 + 20 + 15 + 2500 + 2400) / 5)
    assert stats["Quantidade"]["max"] == 1200  # "1.200" é mil e duzentos
    assert stats["Desconto"]["max"] == pytest.approx(0.15)
    assert stats["Avaliação"]["nulls"] == 1


def test_linhas_saem_como_numeros_e_codigos_preservados(client, importado):
    resposta = client.get(
        f"/api/datasets/{importado['id']}/rows",
        params={"sort": "Total", "order": "desc", "page_size": 1},
    )
    linha = resposta.json()["rows"][0]
    assert linha["Total"] == 2500
    assert linha["Preço unitário"] == 1250
    assert linha["Desconto"] == pytest.approx(0.05)
    assert linha["Código"] == "00789"
    assert linha["CPF do cliente"] == "555.666.777-88"


def test_faixa_em_coluna_de_moeda(client, importado):
    resposta = client.get(
        f"/api/datasets/{importado['id']}/rows",
        params={"ranges": '{"Total": {"min": 1000}}'},
    )
    assert resposta.json()["total"] == 2
