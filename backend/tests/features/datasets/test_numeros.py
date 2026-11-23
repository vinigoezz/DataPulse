"""Números escritos do jeito brasileiro (e internacional) viram números de verdade."""

import pandas as pd
import pytest

from app.features.datasets.importar.numeros import (
    BRASILEIRA,
    INTERNACIONAL,
    converter_numeros,
)
from app.features.datasets.models import CHAVE_TIPOS


def converter(valores: list[str | None], preferida=BRASILEIRA) -> pd.DataFrame:
    return converter_numeros(pd.DataFrame({"c": pd.Series(valores, dtype="string")}), preferida)


def coluna(valores: list[str | None], preferida=BRASILEIRA) -> list:
    return (
        converter(valores, preferida)["c"].astype(object).where(lambda s: s.notna(), None).tolist()
    )


@pytest.mark.parametrize(
    ("valores", "esperado"),
    [
        (["45,50", "20", "1.234,56"], [45.5, 20, 1234.56]),  # brasileiro
        (["1,234.56", "3.5", "10"], [1234.56, 3.5, 10]),  # internacional
        (["-3,5", "+2,25", "(1.000,00)"], [-3.5, 2.25, -1000]),  # sinais e contábil
        (["1 234,5", "2\xa0000,0"], [1234.5, 2000]),  # espaço como milhar (Excel)
    ],
)
def test_formatos_de_numero(valores, esperado):
    assert coluna(valores) == pytest.approx(esperado)


def test_inteiros_continuam_inteiros():
    convertido = converter(["1.500", "20", None])
    assert str(convertido["c"].dtype) == "Int64"
    assert coluna(["1.500", "20", None]) == [1500, 20, None]


def test_ponto_ambiguo_segue_a_convencao_do_arquivo():
    # "1.500": mil e quinhentos num CSV com ";", um e meio num CSV com ",".
    assert coluna(["1.500", "2.250"], BRASILEIRA) == [1500, 2250]
    assert coluna(["1.500", "2.250"], INTERNACIONAL) == pytest.approx([1.5, 2.25])


def test_moeda_e_anotada_e_convertida():
    convertido = converter(["R$ 1.234,56", "-R$ 10,00", "R$ -5,5", None])
    assert convertido.attrs[CHAVE_TIPOS] == {"c": "moeda"}
    assert coluna(["R$ 1.234,56", "-R$ 10,00", "R$ -5,5"]) == pytest.approx([1234.56, -10, -5.5])


def test_percentual_vira_fracao():
    convertido = converter(["15%", "12,5 %", "100%"])
    assert convertido.attrs[CHAVE_TIPOS] == {"c": "percentual"}
    assert coluna(["15%", "12,5 %", "100%"]) == pytest.approx([0.15, 0.125, 1])


@pytest.mark.parametrize(
    "valores",
    [
        ["00123", "00456"],  # código com zero à esquerda
        ["12345678901234567", "98765432109876543"],  # longo demais (perderia dígitos)
        ["123.456.789-00", "987.654.321-00"],  # CPF
        ["Café", "Pão"],
        ["05/01/2026", "06/01/2026"],  # data: fica para o conversor de datas
    ],
)
def test_textos_que_nao_sao_numeros_ficam_como_texto(valores):
    convertido = converter(valores)
    assert convertido["c"].tolist() == valores
    assert convertido.attrs[CHAVE_TIPOS] == {}


def test_poucos_valores_estranhos_viram_vazio():
    # 1 em 10 não é número ("n/d"): a coluna é numérica e o valor estranho vira vazio.
    valores = [str(i) for i in range(9)] + ["n/d"]
    assert coluna(valores) == [*range(9), None]


def test_muitos_valores_estranhos_mantem_texto():
    valores = ["1", "2", "abc", "def"]
    assert converter(valores)["c"].tolist() == valores
