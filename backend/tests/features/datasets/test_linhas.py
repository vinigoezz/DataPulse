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
