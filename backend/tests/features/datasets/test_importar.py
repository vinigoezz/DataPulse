import gzip
import io
import zipfile

from tests.conftest import enviar


def test_importa_csv_e_devolve_o_contrato_do_frontend(dataset_vendas):
    # Contrato em camelCase, igual a Frontend/src/types/index.ts.
    assert set(dataset_vendas) == {
        "id",
        "name",
        "importedAt",
        "rows",
        "columns",
        "sizeBytes",
        "status",
        "description",
    }
    assert dataset_vendas["name"] == "vendas.csv"
    assert dataset_vendas["description"] == "Teste"
    assert (dataset_vendas["rows"], dataset_vendas["columns"]) == (4, 5)
    assert dataset_vendas["status"] == "processado"


def test_aceita_zip_e_gz(client):
    csv = b"a,b\n1,2\n3,4\n"
    pacote = io.BytesIO()
    with zipfile.ZipFile(pacote, "w") as z:
        z.writestr("dados.csv", csv)
        z.writestr("__MACOSX/._dados.csv", b"lixo")  # arquivo oculto do macOS é ignorado
    assert enviar(client, "dados.zip", pacote.getvalue()).json()["rows"] == 2
    assert enviar(client, "dados.csv.gz", gzip.compress(csv)).json()["rows"] == 2


def test_separador_informado_vence_a_deteccao(client):
    resposta = enviar(client, "x.csv", b"a;b\n1;2\n", separator=",")
    assert resposta.json()["columns"] == 1


def test_recusa_arquivos_invalidos_sem_criar_dataset(client):
    assert enviar(client, "planilha.xlsx", b"a,b\n1,2\n").status_code == 422
    assert enviar(client, "vazio.csv", b"").status_code == 422
    assert enviar(client, "so_cabecalho.csv", b"a,b\n").status_code == 422
    assert enviar(client, "quebrado.zip", b"nao e zip").status_code == 422
    grande = b"a,b\n" + b"1,2\n" * 300_000  # > 1 MB (limite dos testes)
    assert enviar(client, "grande.csv", grande).status_code == 413
    assert client.get("/api/datasets").json() == []
