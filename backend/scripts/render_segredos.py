"""Envia os segredos do backend/.env para o Render, mas só depois de testar que funcionam.

Uso: ``make render-segredos``. Precisa, no backend/.env:
- RENDER_API_KEY: chave criada em https://dashboard.render.com/u/settings (API Keys);
- RENDER_SERVICE_ID: o id do serviço (srv-...), que aparece no endereço do painel.

Acaba com o copia-e-cola: o que funciona aqui é exatamente o que vai para lá. Nenhum valor
secreto é mostrado na tela.
"""

import json
import sys
import urllib.error
import urllib.request

from botocore.exceptions import BotoCoreError, ClientError
from dotenv import dotenv_values

from app.shared.arquivos.bucket_s3 import BucketS3
from app.shared.banco.conexao import conectar, problema_no_endereco
from app.shared.config import ARQUIVO_ENV, S3Config

API_RENDER = "https://api.render.com/v1"
SEGREDOS = ("DATAPULSE_DATABASE_URL", "DATAPULSE_S3_ACCESS_KEY", "DATAPULSE_S3_SECRET_KEY")


def parar(mensagem: str) -> None:
    sys.exit(f"✗ {mensagem}\n  Nada foi enviado ao Render.")


def ler_env() -> dict[str, str]:
    valores = {chave: (valor or "").strip() for chave, valor in dotenv_values(ARQUIVO_ENV).items()}
    exigir(valores, SEGREDOS)
    return valores


def exigir(valores: dict[str, str], chaves: tuple[str, ...]) -> None:
    if faltando := [chave for chave in chaves if not valores.get(chave)]:
        parar(f"Preencha no backend/.env: {', '.join(faltando)}")


def testar_banco(url: str) -> None:
    if problema := problema_no_endereco(url):
        parar(f"DATAPULSE_DATABASE_URL inválida. {problema}")
    try:
        with conectar(url) as conexao:
            conexao.execute("select 1")
    except Exception as erro:  # qualquer falha de conexão interrompe o envio
        parar(f"O banco recusou a conexão: {str(erro).splitlines()[0]}")
    print("✓ Banco: senha e endereço funcionam.")


def testar_arquivos(valores: dict[str, str]) -> None:
    config = S3Config(
        bucket=valores.get("DATAPULSE_S3_BUCKET") or "datapulse",
        access_key=valores["DATAPULSE_S3_ACCESS_KEY"],
        secret_key=valores["DATAPULSE_S3_SECRET_KEY"],
        endpoint=valores.get("DATAPULSE_S3_ENDPOINT") or None,
        region=valores.get("DATAPULSE_S3_REGION") or "us-east-1",
    )
    try:
        BucketS3(config).garantir_bucket()
    except (ClientError, BotoCoreError) as erro:
        parar(f"As chaves S3 não funcionaram: {erro}")
    print("✓ Arquivos: chaves S3 funcionam.")


def chamar_render(api_key: str, metodo: str, caminho: str, corpo: dict) -> None:
    pedido = urllib.request.Request(
        f"{API_RENDER}{caminho}",
        data=json.dumps(corpo).encode(),
        method=metodo,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(pedido, timeout=30):
            pass
    except urllib.error.HTTPError as erro:
        dica = " Confira RENDER_API_KEY." if erro.code == 401 else ""
        dica += " Confira RENDER_SERVICE_ID." if erro.code == 404 else ""
        sys.exit(f"✗ O Render respondeu {erro.code} em {metodo} {caminho}.{dica}")


def main() -> None:
    valores = ler_env()
    testar_banco(valores["DATAPULSE_DATABASE_URL"])
    testar_arquivos(valores)
    # Os segredos são testados antes: dá para usar este comando só para conferir a senha.
    exigir(valores, ("RENDER_API_KEY", "RENDER_SERVICE_ID"))

    servico = valores["RENDER_SERVICE_ID"]
    for chave in SEGREDOS:
        # Atualiza uma variável por vez; as outras do serviço continuam como estão.
        chamar_render(
            valores["RENDER_API_KEY"],
            "PUT",
            f"/services/{servico}/env-vars/{chave}",
            {"value": valores[chave]},
        )
        print(f"✓ Render: {chave} atualizada.")

    chamar_render(valores["RENDER_API_KEY"], "POST", f"/services/{servico}/deploys", {})
    print("✓ Render: novo deploy iniciado. Acompanhe no painel (leva alguns minutos).")


if __name__ == "__main__":
    main()
