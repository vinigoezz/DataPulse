"""Importação de planilhas Excel (.xlsx): primeira aba, respeitando o tipo de cada célula."""

from datetime import datetime

import pytest
from openpyxl import Workbook

from tests.conftest import enviar


def _planilha(tmp_path) -> bytes:
    """Como uma planilha brasileira real: células de número e data, mas também valores
    digitados como texto, código com zero à esquerda, linha e coluna em branco."""
    livro = Workbook()
    aba = livro.active
    aba.title = "Vendas"
    aba.append(
        ["Data", "Filial", "Código", "Quantidade", "Total", "Preço (texto)", None, "Desconto"]
    )
    aba.append([datetime(2026, 1, 5), "São Paulo", "00123", 3, 45.0, "R$ 15,00", None, "10%"])
    aba.append([datetime(2026, 1, 6), "Recife", "00456", 1200, 2400.5, "R$ 2,00", None, "5%"])
    aba.append([None] * 8)  # linha em branco no meio
    aba.append([datetime(2026, 1, 7), "Recife", "00789", 2, 2500.0, "R$ 1.250,00", None, "12,5%"])
    livro.create_sheet("Outra aba").append(["isto", "não", "entra"])
    caminho = tmp_path / "vendas.xlsx"
    livro.save(caminho)
    return caminho.read_bytes()


@pytest.fixture
def importado(client, tmp_path) -> dict:
    resposta = enviar(client, "vendas.xlsx", _planilha(tmp_path))
    assert resposta.status_code == 201, resposta.text
    return resposta.json()


def test_importa_a_primeira_aba_sem_linhas_e_colunas_em_branco(importado):
    assert (importado["rows"], importado["columns"]) == (3, 7)


def test_tipos_das_colunas(client, importado):
    stats = client.get(f"/api/datasets/{importado['id']}/stats").json()
    assert {s["key"]: s["type"] for s in stats} == {
        "Data": "data",
        "Filial": "texto",
        "Código": "texto",  # "00123" digitado como texto continua texto
        "Quantidade": "número",
        # Célula numérica formatada como R$ no Excel chega sem o símbolo; "Total" pode ser
        # quantidade, então é "número" (colunas "valor", "receita", "preço"... viram moeda).
        "Total": "número",
        "Preço (texto)": "moeda",  # texto "R$ 1.250,00" convertido como no CSV
        "Desconto": "percentual",
    }


def test_valores_convertidos(client, importado):
    linhas = client.get(
        f"/api/datasets/{importado['id']}/rows", params={"sort": "Total", "order": "desc"}
    ).json()["rows"]
    maior = linhas[0]
    assert maior["Código"] == "00789"
    assert maior["Preço (texto)"] == 1250
    assert maior["Desconto"] == pytest.approx(0.125)
    assert maior["Data"].startswith("2026-01-07")
    assert linhas[1]["Quantidade"] == 1200


def test_excel_corrompido_explica_o_problema(client):
    resposta = enviar(client, "quebrado.xlsx", b"isto nao e uma planilha")
    assert resposta.status_code == 422
    assert "planilha Excel" in resposta.json()["detail"]


def test_formato_antigo_xls_nao_e_aceito(client):
    resposta = enviar(client, "antigo.xls", b"qualquer coisa")
    assert resposta.status_code == 422
    assert ".xlsx" in resposta.json()["detail"]
