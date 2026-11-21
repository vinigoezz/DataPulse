"""Erros esperados da aplicação.

Cada feature cria seus próprios erros herdando de uma destas categorias. A categoria
diz qual status HTTP devolver, então o main.py não precisa conhecer erro de nenhuma feature.
"""

from fastapi import status


class DataPulseError(Exception):
    """Base dos erros esperados; a mensagem é mostrada ao usuário."""

    status_code: int = status.HTTP_400_BAD_REQUEST


class NaoEncontrado(DataPulseError):
    status_code = status.HTTP_404_NOT_FOUND


class EntradaInvalida(DataPulseError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT


class LimiteExcedido(DataPulseError):
    status_code = status.HTTP_413_CONTENT_TOO_LARGE
