"""Leitura de planilhas Excel (.xlsx): a primeira aba, respeitando o tipo de cada célula."""

import zipfile
from datetime import date, datetime
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
    df = df.dropna(how="all").dropna(axis="columns", how="all").infer_objects()
    for coluna in df.columns:
        if df[coluna].dtype == object:  # mistura de tipos, ex.: números e textos "R$ 1.250,00"
            df[coluna] = df[coluna].map(_como_texto).astype("string")
    return tratar_tipos(df, BRASILEIRA)


def _como_texto(valor) -> str | None:
    """Célula → texto que as regras do CSV entendem (convenção brasileira).

    Numa coluna com números e textos misturados, o número 300.5 vira "300,5" para ser lido junto
    com "R$ 1.250,00"; datas viram "05/01/2026", como as digitadas.
    """
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return None
    if isinstance(valor, datetime):
        com_hora = (valor.hour, valor.minute, valor.second) != (0, 0, 0)
        return valor.strftime("%d/%m/%Y %H:%M:%S" if com_hora else "%d/%m/%Y")
    if isinstance(valor, date):
        return valor.strftime("%d/%m/%Y")
    if isinstance(valor, float):
        return format(valor, "f").rstrip("0").rstrip(".").replace(".", ",")  # 300.5 → "300,5"
    return str(valor)
