"""Contrato do armazenamento de arquivos: toda implementação tem que passar nos mesmos testes."""

import uuid

import pytest

from app.shared.arquivos import ArmazenamentoDeArquivos, ArquivoAusente, criar_armazenamento
from app.shared.arquivos.bucket_s3 import BucketS3
from app.shared.arquivos.pasta_local import PastaLocal


@pytest.fixture(params=["pasta_local", "s3"])
def arquivos(request, tmp_path) -> ArmazenamentoDeArquivos:
    if request.param == "pasta_local":
        return PastaLocal(tmp_path)
    return BucketS3(request.getfixturevalue("s3_de_teste"))


@pytest.fixture
def chave() -> str:
    return f"testes/{uuid.uuid4().hex}/data.parquet"


def test_guarda_e_le_os_mesmos_bytes(arquivos, chave):
    arquivos.guardar(chave, b"\x00conteudo\xff")
    assert arquivos.ler(chave) == b"\x00conteudo\xff"


def test_guardar_de_novo_substitui(arquivos, chave):
    arquivos.guardar(chave, b"antigo")
    arquivos.guardar(chave, b"novo")
    assert arquivos.ler(chave) == b"novo"


def test_ler_chave_inexistente_avisa_ausencia(arquivos, chave):
    with pytest.raises(ArquivoAusente):
        arquivos.ler(chave)


def test_apagar_remove_e_nao_reclama_se_ja_nao_existe(arquivos, chave):
    arquivos.guardar(chave, b"x")
    arquivos.apagar(chave)
    arquivos.apagar(chave)
    with pytest.raises(ArquivoAusente):
        arquivos.ler(chave)


def test_pasta_local_nao_sai_da_raiz(tmp_path):
    with pytest.raises(ValueError):
        PastaLocal(tmp_path / "raiz").guardar("../fora.txt", b"x")


def test_pasta_local_limpa_pastas_vazias(tmp_path):
    pasta = PastaLocal(tmp_path)
    pasta.guardar("datasets/ds-1/data.parquet", b"x")
    pasta.apagar("datasets/ds-1/data.parquet")
    assert not (tmp_path / "datasets").exists()


def test_escolhe_pela_configuracao(tmp_path):
    assert isinstance(criar_armazenamento(None, tmp_path), PastaLocal)
