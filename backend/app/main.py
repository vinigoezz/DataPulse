"""Ponto de entrada da API: `uvicorn app.main:app --reload` (dentro de backend/).

Só monta a aplicação: CORS, tradução de erros e o registro das features.
Regras de negócio ficam dentro de cada feature em app/features/.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app import __version__
from app.features import datasets, health
from app.shared.config import get_settings
from app.shared.errors import DataPulseError


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
    def erro_esperado(_: Request, erro: DataPulseError) -> JSONResponse:
        return JSONResponse(status_code=erro.status_code, content={"detail": str(erro)})

    @app.get("/", include_in_schema=False)
    def raiz() -> RedirectResponse:
        return RedirectResponse(url="/docs")

    app.include_router(health.router, prefix="/api")
    app.include_router(datasets.router, prefix="/api")
    return app


app = create_app()
