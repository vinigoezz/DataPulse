"""Erros da feature datasets. A categoria herdada define o status HTTP (app/shared/errors.py)."""

from app.shared.errors import EntradaInvalida, LimiteExcedido, NaoEncontrado


class DatasetNaoEncontrado(NaoEncontrado):
    def __init__(self, dataset_id: str):
        super().__init__(f"Dataset '{dataset_id}' não encontrado.")


class ArquivoInvalido(EntradaInvalida):
    """O arquivo enviado não pôde ser lido como CSV."""


class ArquivoMuitoGrande(LimiteExcedido):
    def __init__(self, limite_mb: int):
        super().__init__(f"O arquivo excede o limite de {limite_mb} MB.")


class ConsultaInvalida(EntradaInvalida):
    """Busca, filtro ou ordenação pedidos de um jeito que não dá para atender."""
