"""GET /api/health: responde se a API está no ar e qual versão está rodando."""

from typing import Literal

from fastapi import APIRouter

from app import __version__
from app.shared.api_model import ApiModel

router = APIRouter(tags=["health"])


class Health(ApiModel):
    status: Literal["ok"]
    version: str


@router.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", version=__version__)
