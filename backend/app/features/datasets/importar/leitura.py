"""Escolhe como ler o arquivo enviado, pela extensão."""

from pathlib import Path

import pandas as pd

from app.features.datasets.importar import leitura_csv, leitura_excel

EXTENSOES = leitura_csv.EXTENSOES + leitura_excel.EXTENSOES
FORMATOS_ACEITOS = ".csv, .xlsx, .zip ou .gz"


def extensao_valida(nome: str) -> bool:
    return nome.lower().endswith(EXTENSOES)


def ler_planilha(
    caminho: Path, nome_original: str, separador: str | None, encoding: str | None
) -> tuple[pd.DataFrame, str, str]:
    """Devolve (dados, separador, encoding). Para Excel, separador e encoding ficam vazios."""
    if nome_original.lower().endswith(leitura_excel.EXTENSOES):
        return leitura_excel.ler_excel(caminho), "", ""
    return leitura_csv.ler_csv(caminho, nome_original, separador, encoding)
