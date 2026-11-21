def test_health_responde_ok(client):
    resposta = client.get("/api/health")
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "ok"


def test_raiz_leva_para_a_documentacao(client):
    resposta = client.get("/", follow_redirects=False)
    assert resposta.status_code == 307
    assert resposta.headers["location"] == "/docs"
