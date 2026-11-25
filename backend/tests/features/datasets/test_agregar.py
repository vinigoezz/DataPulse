"""Totais para o Dashboard: geral, por período e por categoria.

Dataset de vendas (conftest): 05 a 08/01/2026 · filiais São Paulo, São Paulo, Recife, Recife ·
produtos Café, Pão, Café, Bolo · quantidade 3, 10, 1, 2 · receita 45,50, 20, 15, vazio.
"""

import pytest


def _agregar(client, dataset_id: str, **params) -> dict:
    resposta = client.get(f"/api/datasets/{dataset_id}/aggregate", params=params)
    assert resposta.status_code == 200, resposta.text
    return resposta.json()


def test_sem_medida_so_conta_linhas(client, dataset_vendas):
    resultado = _agregar(client, dataset_vendas["id"])
    assert resultado["overall"] == {"count": 4, "sum": None, "mean": None, "min": None, "max": None}
    assert resultado["groups"] == [] and resultado["other"] is None


def test_resumo_geral_da_medida(client, dataset_vendas):
    geral = _agregar(client, dataset_vendas["id"], measure="receita")["overall"]
    assert geral["count"] == 4  # linhas; a receita vazia não entra na soma nem na média
    assert geral["sum"] == pytest.approx(80.5)
    assert geral["mean"] == pytest.approx(80.5 / 3)
    assert (geral["min"], geral["max"]) == (15, 45.5)


def test_por_categoria_do_maior_para_o_menor(client, dataset_vendas):
    grupos = _agregar(client, dataset_vendas["id"], measure="receita", group_by="filial")["groups"]
    assert [(g["key"], g["sum"], g["count"]) for g in grupos] == [
        ("São Paulo", 65.5, 2),
        ("Recife", 15, 2),
    ]


def test_categorias_alem_do_limite_viram_outros(client, dataset_vendas):
    resultado = _agregar(
        client, dataset_vendas["id"], measure="quantidade", group_by="produto", limit=1
    )
    # quantidade por produto: Pão 10, Café 3 + 1 = 4, Bolo 2
    assert [(g["key"], g["sum"]) for g in resultado["groups"]] == [("Pão", 10)]
    assert resultado["other"]["count"] == 3 and resultado["other"]["sum"] == 6


def test_sem_medida_ordena_pela_contagem(client, dataset_vendas):
    grupos = _agregar(client, dataset_vendas["id"], group_by="produto")["groups"]
    assert grupos[0] == {
        "key": "Café",
        "count": 2,
        "sum": None,
        "mean": None,
        "min": None,
        "max": None,
    }


def test_grupo_sem_nenhum_valor_tem_soma_vazia(client, dataset_vendas):
    grupos = _agregar(client, dataset_vendas["id"], measure="receita", group_by="produto")["groups"]
    bolo = next(g for g in grupos if g["key"] == "Bolo")
    assert bolo["count"] == 1 and bolo["sum"] is None


@pytest.mark.parametrize(
    ("intervalo", "chaves"),
    [
        ("dia", ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08"]),
        ("semana", ["2026-01-05"]),  # a semana começa na segunda-feira, 05/01
        ("mes", ["2026-01-01"]),
        ("trimestre", ["2026-01-01"]),
        ("ano", ["2026-01-01"]),
    ],
)
def test_por_periodo_em_ordem_cronologica(client, dataset_vendas, intervalo, chaves):
    grupos = _agregar(
        client, dataset_vendas["id"], measure="receita", group_by="data", interval=intervalo
    )["groups"]
    assert [g["key"] for g in grupos] == chaves


def test_filtros_e_faixas_valem_antes_de_agregar(client, dataset_vendas):
    resultado = _agregar(
        client,
        dataset_vendas["id"],
        measure="receita",
        group_by="data",
        interval="dia",
        filters='{"filial": "São Paulo"}',
        ranges='{"data": {"max": "2026-01-05"}}',
    )
    assert resultado["overall"]["sum"] == 45.5
    assert [g["key"] for g in resultado["groups"]] == ["2026-01-05"]


@pytest.mark.parametrize(
    ("params", "trecho"),
    [
        ({"measure": "filial"}, "precisa ser uma coluna numérica"),
        ({"group_by": "quantidade"}, "não por números"),
        ({"measure": "nao_existe"}, "inexistente"),
        ({"interval": "seculo", "group_by": "data"}, ""),
    ],
)
def test_pedido_invalido_explica_o_problema(client, dataset_vendas, params, trecho):
    resposta = client.get(f"/api/datasets/{dataset_vendas['id']}/aggregate", params=params)
    assert resposta.status_code == 422
    assert trecho in str(resposta.json()["detail"])


def test_estatisticas_trazem_inicio_e_fim_das_datas(client, dataset_vendas):
    stats = {s["key"]: s for s in client.get(f"/api/datasets/{dataset_vendas['id']}/stats").json()}
    assert (stats["data"]["start"], stats["data"]["end"]) == (
        "2026-01-05T00:00:00",
        "2026-01-08T00:00:00",
    )
    assert stats["receita"]["start"] is None
