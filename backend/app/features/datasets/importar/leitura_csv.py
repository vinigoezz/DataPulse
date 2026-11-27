"""Leitura de CSV puro, .zip ou .gz, com encoding e separador detectados."""

import csv
import gzip
import zipfile
from pathlib import Path
from typing import IO

import pandas as pd

from app.features.datasets.errors import ArquivoInvalido
from app.features.datasets.importar.numeros import convencao_preferida
from app.features.datasets.importar.tipos import tratar_tipos

EXTENSOES = (".csv", ".zip", ".gz")
SEPARADORES = ",;\t|"
ENCODINGS = ("utf-8", "latin-1")

# Bytes lidos do início do arquivo para descobrir o separador.
BYTES_AMOSTRA = 64 * 1024
# Erros que o Python levanta quando um .zip/.gz está corrompido.
ERROS_DE_COMPACTACAO = (gzip.BadGzipFile, EOFError, zipfile.BadZipFile)


def _arquivo_compactado_invalido(erro: Exception) -> ArquivoInvalido:
    return ArquivoInvalido(f"Não foi possível abrir o arquivo compactado: {erro}")


def abrir_csv(caminho: Path, nome_original: str) -> IO[bytes]:
    """Devolve um stream binário do CSV, descompactando .zip ou .gz se preciso."""
    nome = nome_original.lower()
    try:
        if nome.endswith(".gz"):
            return gzip.open(caminho)
        if nome.endswith(".zip"):
            pacote = zipfile.ZipFile(caminho)
            # O "Comprimir" do macOS inclui arquivos ocultos (__MACOSX/, ._nome) no .zip.
            csvs = [
                n
                for n in pacote.namelist()
                if n.lower().endswith(".csv")
                and not n.startswith("__MACOSX/")
                and not n.rsplit("/", 1)[-1].startswith("._")
            ]
            if len(csvs) != 1:
                raise ArquivoInvalido(
                    f"O .zip precisa conter exatamente um arquivo CSV (encontrados: {len(csvs)})."
                )
            return pacote.open(csvs[0])
    except zipfile.BadZipFile as erro:
        raise _arquivo_compactado_invalido(erro) from erro
    return open(caminho, "rb")


def detectar_encoding(caminho: Path, nome_original: str) -> str:
    """Primeiro encoding da lista que decodifica o início do arquivo."""
    with abrir_csv(caminho, nome_original) as stream:
        amostra = _ler_amostra(stream)
    for encoding in ENCODINGS:
        try:
            amostra.decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    return ENCODINGS[-1]


def detectar_separador(caminho: Path, nome_original: str, encoding: str) -> str:
    with abrir_csv(caminho, nome_original) as stream:
        amostra = _ler_amostra(stream).decode(encoding, errors="ignore")
    # Descarta a última linha, que pode ter sido cortada no meio.
    amostra = amostra.rsplit("\n", 1)[0] if "\n" in amostra else amostra
    try:
        return csv.Sniffer().sniff(amostra, delimiters=SEPARADORES).delimiter
    except csv.Error:
        return ","


def _ler_amostra(stream: IO[bytes]) -> bytes:
    try:
        return stream.read(BYTES_AMOSTRA)
    except ERROS_DE_COMPACTACAO as erro:
        raise _arquivo_compactado_invalido(erro) from erro


def ler_csv(
    caminho: Path,
    nome_original: str,
    separador: str | None = None,
    encoding: str | None = None,
) -> tuple[pd.DataFrame, str, str]:
    """Lê o arquivo e devolve (DataFrame, separador usado, encoding usado).

    Separador e encoding são detectados quando não informados.
    """
    encoding = encoding or detectar_encoding(caminho, nome_original)
    separador = separador or detectar_separador(caminho, nome_original, encoding)
    try:
        with abrir_csv(caminho, nome_original) as stream:
            # Tudo entra como texto: quem decide o que é número ou data somos nós, entendendo
            # o formato brasileiro (o pandas leria "1.500" como 1,5).
            df = pd.read_csv(stream, sep=separador, encoding=encoding, dtype="string")
    except UnicodeDecodeError as erro:
        raise ArquivoInvalido(
            f"Não foi possível ler o arquivo com a codificação {encoding}."
        ) from erro
    except (pd.errors.ParserError, pd.errors.EmptyDataError) as erro:
        raise ArquivoInvalido(f"Erro ao ler o CSV: {erro}") from erro
    except ERROS_DE_COMPACTACAO as erro:
        raise _arquivo_compactado_invalido(erro) from erro
    return tratar_tipos(df, convencao_preferida(separador)), separador, encoding
