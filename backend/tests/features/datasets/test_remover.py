def test_remove_um_dataset(client, dataset_vendas):
    assert client.delete(f"/api/datasets/{dataset_vendas['id']}").status_code == 204
    assert client.get(f"/api/datasets/{dataset_vendas['id']}").status_code == 404
    assert client.get("/api/datasets").json() == []


def test_remover_inexistente(client):
    assert client.delete("/api/datasets/ds-naoexiste").status_code == 404
