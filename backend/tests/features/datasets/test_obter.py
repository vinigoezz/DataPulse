def test_obtem_um_dataset(client, dataset_vendas):
    assert client.get(f"/api/datasets/{dataset_vendas['id']}").json() == dataset_vendas


def test_id_inexistente_ou_malicioso(client):
    assert client.get("/api/datasets/ds-naoexiste").status_code == 404
    # Tentativa de sair da pasta de dados ("path traversal") também vira 404.
    assert client.get("/api/datasets/..%2F..%2Fetc").status_code == 404
