"""O navegador só deixa o site falar com a API se a API autorizar a origem (CORS)."""

from fastapi.testclient import TestClient

from app.main import create_app
from app.shared.config import Settings

SETTINGS = Settings(
    cors_origins=["https://datapulse.vercel.app"],
    cors_origin_regex=r"https://datapulse-[a-z0-9-]+\.vercel\.app",
)


def origem_autorizada(origem: str) -> str | None:
    client = TestClient(create_app(SETTINGS))
    resposta = client.get("/api/health", headers={"Origin": origem})
    return resposta.headers.get("access-control-allow-origin")


def test_origem_fixa_autorizada():
    assert origem_autorizada("https://datapulse.vercel.app") == "https://datapulse.vercel.app"


def test_previa_da_vercel_autorizada_pelo_padrao():
    origem = "https://datapulse-git-main-fulano.vercel.app"
    assert origem_autorizada(origem) == origem


def test_outro_site_recusado():
    assert origem_autorizada("https://site-malicioso.com") is None
