"""Ponto de entrada da API: `uvicorn app.main:app --reload` (dentro de backend/)."""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.api.routes import datasets, health
from app.core.config import get_settings
from app.core.errors import (
    ArquivoInvalido,
    ArquivoMuitoGrande,
    DataPulseError,
    DatasetNaoEncontrado,
)

STATUS_POR_ERRO: dict[type[DataPulseError], int] = {
    DatasetNaoEncontrado: status.HTTP_404_NOT_FOUND,
    ArquivoInvalido: status.HTTP_422_UNPROCESSABLE_CONTENT,
    ArquivoMuitoGrande: status.HTTP_413_CONTENT_TOO_LARGE,
}


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="DataPulse API", version=__version__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(DataPulseError)
    def erro_de_dominio(_: Request, erro: DataPulseError) -> JSONResponse:
        codigo = STATUS_POR_ERRO.get(type(erro), status.HTTP_400_BAD_REQUEST)
        return JSONResponse(status_code=codigo, content={"detail": str(erro)})

    app.include_router(health.router, prefix="/api")
    app.include_router(datasets.router, prefix="/api")
    return app


app = create_app()
