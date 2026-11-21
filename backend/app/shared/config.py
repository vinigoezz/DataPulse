"""Configuração da API, lida de variáveis de ambiente com prefixo DATAPULSE_."""

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path


def _lista(valor: str) -> list[str]:
    return [item.strip() for item in valor.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    storage_dir: Path = Path("storage")
    cors_origins: list[str] = field(
        default_factory=lambda: ["http://localhost:8080", "http://localhost:5173"]
    )
    max_upload_mb: int = 200

    @classmethod
    def from_env(cls) -> "Settings":
        padrao = cls()
        return cls(
            storage_dir=Path(os.environ.get("DATAPULSE_STORAGE_DIR", padrao.storage_dir)),
            cors_origins=_lista(os.environ["DATAPULSE_CORS_ORIGINS"])
            if "DATAPULSE_CORS_ORIGINS" in os.environ
            else padrao.cors_origins,
            max_upload_mb=int(os.environ.get("DATAPULSE_MAX_UPLOAD_MB", padrao.max_upload_mb)),
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()
