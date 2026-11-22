"""Configuração da API, lida de variáveis de ambiente com prefixo DATAPULSE_.

Em desenvolvimento, as variáveis podem ficar em ``backend/.env`` (ignorado pelo git).
Na hospedagem, são cadastradas no painel do provedor. O código nunca sabe qual é o
provedor: só recebe endereços e chaves.
"""

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

ARQUIVO_ENV = Path(__file__).resolve().parents[2] / ".env"


def _lista(valor: str) -> list[str]:
    return [item.strip() for item in valor.split(",") if item.strip()]


def _opcional(nome: str) -> str | None:
    return os.environ.get(nome, "").strip() or None


@dataclass(frozen=True)
class S3Config:
    """Qualquer armazenamento compatível com S3: Supabase Storage, AWS S3, Cloudflare R2, MinIO."""

    bucket: str
    access_key: str
    secret_key: str
    endpoint: str | None = None  # None = AWS S3 de verdade
    region: str = "us-east-1"

    @classmethod
    def from_env(cls) -> "S3Config | None":
        bucket = _opcional("DATAPULSE_S3_BUCKET")
        if bucket is None:
            return None
        return cls(
            bucket=bucket,
            access_key=os.environ["DATAPULSE_S3_ACCESS_KEY"],
            secret_key=os.environ["DATAPULSE_S3_SECRET_KEY"],
            endpoint=_opcional("DATAPULSE_S3_ENDPOINT"),
            region=_opcional("DATAPULSE_S3_REGION") or cls.region,
        )


@dataclass(frozen=True)
class Settings:
    # Sem banco/S3 configurados, tudo fica nesta pasta (desenvolvimento e testes).
    storage_dir: Path = Path("storage")
    database_url: str | None = None
    s3: S3Config | None = None
    cors_origins: list[str] = field(
        default_factory=lambda: ["http://localhost:8080", "http://localhost:5173"]
    )
    cors_origin_regex: str | None = None
    max_upload_mb: int = 200

    @classmethod
    def from_env(cls) -> "Settings":
        padrao = cls()
        return cls(
            storage_dir=Path(os.environ.get("DATAPULSE_STORAGE_DIR", padrao.storage_dir)),
            database_url=_opcional("DATAPULSE_DATABASE_URL"),
            s3=S3Config.from_env(),
            cors_origins=_lista(os.environ["DATAPULSE_CORS_ORIGINS"])
            if "DATAPULSE_CORS_ORIGINS" in os.environ
            else padrao.cors_origins,
            cors_origin_regex=_opcional("DATAPULSE_CORS_ORIGIN_REGEX"),
            max_upload_mb=int(os.environ.get("DATAPULSE_MAX_UPLOAD_MB", padrao.max_upload_mb)),
        )


@lru_cache
def get_settings() -> Settings:
    # Não sobrescreve variáveis já definidas (as do provedor de hospedagem têm prioridade).
    load_dotenv(ARQUIVO_ENV)
    return Settings.from_env()
