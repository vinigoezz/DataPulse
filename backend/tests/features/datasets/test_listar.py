def test_lista_vazia(client):
    assert client.get("/api/datasets").json() == []


def test_lista_os_datasets_importados(client, dataset_vendas):
    assert [d["id"] for d in client.get("/api/datasets").json()] == [dataset_vendas["id"]]
