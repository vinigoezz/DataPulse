from fastapi import APIRouter

from app import __version__
from app.schemas.datasets import Health

router = APIRouter(tags=["health"])


@router.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", version=__version__)
