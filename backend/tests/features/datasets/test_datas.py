import pandas as pd

from app.features.datasets.importar.datas import converter_datas


def test_converte_so_colunas_que_sao_quase_todas_datas():
    df = pd.DataFrame(
        {
            "quando": ["01/02/2026", "15/03/2026", "31/12/2025"],
            "misto": ["01/02/2026", "abc", "def"],
        }
    )
    convertido = converter_datas(df)
    assert pd.api.types.is_datetime64_any_dtype(convertido["quando"])
    assert convertido["quando"].iloc[0].month == 2  # dia primeiro (formato brasileiro)
    assert not pd.api.types.is_datetime64_any_dtype(convertido["misto"])


def test_codigos_so_com_digitos_nao_viram_data():
    df = pd.DataFrame({"codigo": pd.Series(["00123", "00456", "00789"], dtype="string")})
    assert converter_datas(df)["codigo"].tolist() == ["00123", "00456", "00789"]
