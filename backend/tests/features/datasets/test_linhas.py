import pytest


def test_pagina_as_linhas(client, dataset_vendas):
    resposta = client.get(f"/api/datasets/{dataset_vendas['id']}/rows?page=2&page_size=3")
    pagina = resposta.json()
    assert pagina["total"] == 4 and pagina["page"] == 2 and pagina["pageSize"] == 3
    assert pagina["rows"] == [
        {
            "data": "2026-01-08T00:00:00.000",
            "filial": "Recife",
            "produto": "Bolo",
            "quantidade": 2,
            "receita": None,
        }
    ]


def test_linhas_de_dataset_inexistente(client):
    assert client.get("/api/datasets/ds-naoexiste/rows").status_code == 404


def _linhas(client, dataset_id: str, **params) -> dict:
    resposta = client.get(f"/api/datasets/{dataset_id}/rows", params=params)
    assert resposta.status_code == 200, resposta.text
    return resposta.json()


def test_busca_em_todas_as_colunas_sem_diferenciar_maiusculas(client, dataset_vendas):
    pagina = _linhas(client, dataset_vendas["id"], search="café")
    assert pagina["total"] == 2
    assert {linha["produto"] for linha in pagina["rows"]} == {"Café"}


def test_filtra_por_valor_exato(client, dataset_vendas):
    pagina = _linhas(client, dataset_vendas["id"], filters='{"filial": "Recife"}')
    assert pagina["total"] == 2
    assert {linha["filial"] for linha in pagina["rows"]} == {"Recife"}


def test_filtro_de_coluna_numerica_compara_como_texto(client, dataset_vendas):
    assert _linhas(client, dataset_vendas["id"], filters='{"quantidade": "10"}')["total"] == 1


def test_ordena_e_deixa_vazios_no_fim(client, dataset_vendas):
    crescente = _linhas(client, dataset_vendas["id"], sort="quantidade")
    assert [linha["quantidade"] for linha in crescente["rows"]] == [1, 2, 3, 10]
    decrescente = _linhas(client, dataset_vendas["id"], sort="receita", order="desc")
    assert decrescente["rows"][-1]["receita"] is None


def test_combina_filtro_ordenacao_e_pagina(client, dataset_vendas):
    pagina = _linhas(
        client,
        dataset_vendas["id"],
        filters='{"filial": "Recife"}',
        sort="quantidade",
        order="desc",
        page=1,
        page_size=1,
    )
    assert pagina["total"] == 2  # total conta as linhas filtradas, não só a página
    assert [linha["produto"] for linha in pagina["rows"]] == ["Bolo"]  # quantidade 2 > 1


def test_busca_respeita_os_filtros(client, dataset_vendas):
    pagina = _linhas(client, dataset_vendas["id"], filters='{"filial": "Recife"}', search="café")
    assert pagina["total"] == 1
    assert pagina["rows"][0]["filial"] == "Recife"


def test_consulta_invalida_responde_422(client, dataset_vendas):
    url = f"/api/datasets/{dataset_vendas['id']}/rows"
    assert client.get(url, params={"sort": "nao_existe"}).status_code == 422
    assert client.get(url, params={"filters": '{"nao_existe": "x"}'}).status_code == 422
    assert client.get(url, params={"filters": "nao é json"}).status_code == 422
    assert client.get(url, params={"filters": '["lista"]'}).status_code == 422
    assert client.get(url, params={"order": "aleatoria"}).status_code == 422


def _produtos(pagina: dict) -> list[str]:
    return [linha["produto"] for linha in pagina["rows"]]


def test_faixa_numerica_com_minimo_e_maximo(client, dataset_vendas):
    # receita: Café 45,50 · Pão 20 · Café 15 · Bolo vazio (vazios nunca entram numa faixa)
    pagina = _linhas(client, dataset_vendas["id"], ranges='{"receita": {"min": 15, "max": 20}}')
    assert pagina["total"] == 2
    assert _produtos(pagina) == ["Pão", "Café"]


def test_faixa_com_um_lado_aberto(client, dataset_vendas):
    assert _linhas(client, dataset_vendas["id"], ranges='{"quantidade": {"min": 3}}')["total"] == 2


def test_faixa_de_datas_inclui_o_ultimo_dia(client, dataset_vendas):
    faixa = '{"data": {"min": "2026-01-06", "max": "2026-01-07"}}'
    pagina = _linhas(client, dataset_vendas["id"], ranges=faixa)
    assert _produtos(pagina) == ["Pão", "Café"]


def test_faixa_combina_com_filtro_e_busca(client, dataset_vendas):
    pagina = _linhas(
        client,
        dataset_vendas["id"],
        filters='{"filial": "Recife"}',
        ranges='{"quantidade": {"max": 1}}',
        search="caf",
    )
    assert pagina["total"] == 1 and pagina["rows"][0]["data"].startswith("2026-01-07")


@pytest.mark.parametrize(
    ("ranges", "trecho"),
    [
        ('{"filial": {"min": 1}}', "não é de número nem de data"),
        ('{"receita": {"min": "muito"}}', "Limite inválido"),
        ('{"nao_existe": {"min": 1}}', "inexistente"),
        ('{"receita": 10}', "precisa ser um objeto"),
        ("{quebrado", "JSON válido"),
    ],
)
def test_faixa_invalida_explica_o_problema(client, dataset_vendas, ranges, trecho):
    resposta = client.get(f"/api/datasets/{dataset_vendas['id']}/rows", params={"ranges": ranges})
    assert resposta.status_code == 422
    assert trecho in resposta.json()["detail"]


@pytest.mark.parametrize(
    ("termo", "produtos"),
    [
        ("45,50", ["Café"]),  # número no formato brasileiro acha a receita 45,5
        ("10", ["Pão"]),  # quantidade 10 (número inteiro)
        ("07/01/2026", ["Café"]),  # data no formato brasileiro
        ("2026-01-08", ["Bolo"]),  # data no formato ISO
        ("recife", ["Café", "Bolo"]),  # texto continua sendo "contém"
    ],
)
def test_busca_entende_numeros_e_datas(client, dataset_vendas, termo, produtos):
    assert _produtos(_linhas(client, dataset_vendas["id"], search=termo)) == produtos
