"""Recorte de uma página do DataFrame, já no formato JSON."""

import json
from typing import Any

import pandas as pd


def paginar(dados: pd.DataFrame, pagina: int, tamanho: int) -> list[dict[str, Any]]:
    inicio = (pagina - 1) * tamanho
    recorte = dados.iloc[inicio : inicio + tamanho]
    # to_json resolve NaN -> null e datas -> ISO 8601 de uma vez.
    return json.loads(recorte.to_json(orient="records", date_format="iso"))
