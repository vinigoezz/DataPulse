"""Leitura de planilhas Excel (.xlsx): a primeira aba, respeitando o tipo de cada célula."""

import zipfile
from pathlib import Path

import pandas as pd
from python_calamine import CalamineError

from app.features.datasets.errors import ArquivoInvalido
from app.features.datasets.importar.numeros import BRASILEIRA
from app.features.datasets.importar.tipos import tratar_tipos

EXTENSOES = (".xlsx",)


def ler_excel(caminho: Path) -> pd.DataFrame:
    """Lê a primeira aba. Células de número e data já vêm com tipo; textos passam pelas
    mesmas regras do CSV ("R$ 1.234,56", "05/01/2026"). A convenção é a brasileira.

    ``dtype=object`` + ``infer_objects()`` mantém o que a planilha diz: um código digitado como
    texto ("00123") continua texto, em vez de virar o número 123.
    """
    try:
        # calamine (Rust) lê ~8x mais rápido que o openpyxl: importa no plano grátis do Render.
        df = pd.read_excel(caminho, sheet_name=0, engine="calamine", dtype=object)
    except (CalamineError, zipfile.BadZipFile, ValueError) as erro:
        raise ArquivoInvalido(f"Não foi possível ler a planilha Excel: {erro}") from erro
    df = df.dropna(how="all").dropna(axis="columns", how="all")  # linhas/colunas em branco
    return tratar_tipos(df.infer_objects(), BRASILEIRA)
