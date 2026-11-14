"""Erros de domínio. A camada de API traduz cada um para um status HTTP (ver app.main)."""


class DataPulseError(Exception):
    """Base dos erros esperados; a mensagem é mostrada ao usuário."""


class DatasetNaoEncontrado(DataPulseError):
    def __init__(self, dataset_id: str):
        super().__init__(f"Dataset '{dataset_id}' não encontrado.")


class ArquivoInvalido(DataPulseError):
    """O arquivo enviado não pôde ser lido como CSV."""


class ArquivoMuitoGrande(DataPulseError):
    def __init__(self, limite_mb: int):
        super().__init__(f"O arquivo excede o limite de {limite_mb} MB.")
