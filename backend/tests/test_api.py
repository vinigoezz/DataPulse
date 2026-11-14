import gzip
import io
import zipfile

VENDAS = (
    "data;filial;produto;quantidade;receita\n"
    "05/01/2026;São Paulo;Café;3;45,50\n"
    "06/01/2026;São Paulo;Pão;10;20\n"
    "07/01/2026;Recife;Café;1;15\n"
    "08/01/2026;Recife;Bolo;2;\n"
)


def enviar(client, nome: str, conteudo: bytes, **form):
    return client.post(
        "/api/datasets/upload", files={"file": (nome, conteudo)}, data=form
    )


def test_health(client):
    resposta = client.get("/api/health")
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "ok"


def test_fluxo_completo_de_um_dataset(client):
    resposta = enviar(client, "vendas.csv", VENDAS.encode("latin-1"), description="Teste")
    assert resposta.status_code == 201, resposta.text
    dataset = resposta.json()
    # Contrato em camelCase, igual a Frontend/src/types/index.ts.
    assert set(dataset) == {
        "id", "name", "importedAt", "rows", "columns", "sizeBytes", "status", "description"
    }
    assert dataset["name"] == "vendas.csv"
    assert (dataset["rows"], dataset["columns"]) == (4, 5)
    assert dataset["status"] == "processado"

    assert [d["id"] for d in client.get("/api/datasets").json()] == [dataset["id"]]
    assert client.get(f"/api/datasets/{dataset['id']}").json() == dataset

    pagina = client.get(f"/api/datasets/{dataset['id']}/rows?page=2&page_size=3").json()
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

    stats = {s["key"]: s for s in client.get(f"/api/datasets/{dataset['id']}/stats").json()}
    assert stats["data"]["type"] == "data"
    assert stats["filial"]["type"] == "categoria"
    assert stats["quantidade"]["type"] == "número"
    assert stats["quantidade"]["mean"] == 4
    assert stats["receita"]["type"] == "texto"  # vírgula decimal: ainda não convertido
    assert stats["receita"]["nulls"] == 1

    assert client.delete(f"/api/datasets/{dataset['id']}").status_code == 204
    assert client.get(f"/api/datasets/{dataset['id']}").status_code == 404
    assert client.get("/api/datasets").json() == []


def test_upload_compactado(client):
    csv = b"a,b\n1,2\n3,4\n"
    pacote = io.BytesIO()
    with zipfile.ZipFile(pacote, "w") as z:
        z.writestr("dados.csv", csv)
        z.writestr("__MACOSX/._dados.csv", b"lixo")
    assert enviar(client, "dados.zip", pacote.getvalue()).json()["rows"] == 2
    assert enviar(client, "dados.csv.gz", gzip.compress(csv)).json()["rows"] == 2


def test_separador_informado_vence_a_deteccao(client):
    resposta = enviar(client, "x.csv", b"a;b\n1;2\n", separator=",")
    assert resposta.json()["columns"] == 1


def test_erros_de_upload(client):
    assert enviar(client, "planilha.xlsx", b"a,b\n1,2\n").status_code == 422
    assert enviar(client, "vazio.csv", b"").status_code == 422
    assert enviar(client, "so_cabecalho.csv", b"a,b\n").status_code == 422
    assert enviar(client, "quebrado.zip", b"nao e zip").status_code == 422
    grande = b"a,b\n" + b"1,2\n" * 300_000  # > 1 MB (limite dos testes)
    assert enviar(client, "grande.csv", grande).status_code == 413
    assert client.get("/api/datasets").json() == []


def test_id_invalido_ou_inexistente(client):
    assert client.get("/api/datasets/ds-naoexiste/rows").status_code == 404
    assert client.get("/api/datasets/..%2F..%2Fetc/stats").status_code == 404
    assert client.delete("/api/datasets/ds-naoexiste").status_code == 404
