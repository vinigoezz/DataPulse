import pandas as pd

from app.services.ingestion import converter_datas
from app.services.profiling import inferir_tipo


def test_inferir_tipo():
    assert inferir_tipo(pd.Series([1.5, 2.0], name="receita")) == "moeda"
    assert inferir_tipo(pd.Series([1, 2], name="quantidade")) == "número"
    assert inferir_tipo(pd.Series(pd.to_datetime(["2026-01-01"]), name="d")) == "data"
    assert inferir_tipo(pd.Series(["SP", "RJ", "SP", "RJ"], name="uf")) == "categoria"
    assert inferir_tipo(pd.Series(["Ana", "Bia", "Caio"], name="nome")) == "texto"
    assert inferir_tipo(pd.Series([True, False], name="ativo")) == "categoria"


def test_converter_datas_respeita_limiar():
    df = pd.DataFrame(
        {
            "quando": ["01/02/2026", "15/03/2026", "31/12/2025"],
            "misto": ["01/02/2026", "abc", "def"],
        }
    )
    convertido = converter_datas(df)
    assert pd.api.types.is_datetime64_any_dtype(convertido["quando"])
    assert convertido["quando"].iloc[0].month == 2  # dia primeiro
    assert not pd.api.types.is_datetime64_any_dtype(convertido["misto"])
