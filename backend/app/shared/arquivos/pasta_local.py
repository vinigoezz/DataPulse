"""Arquivos numa pasta do computador. Usado em desenvolvimento e nos testes."""

import os
from pathlib import Path

from app.shared.arquivos.porta import ArquivoAusente


class PastaLocal:
    def __init__(self, raiz: Path):
        self.raiz = raiz

    def _caminho(self, chave: str) -> Path:
        caminho = (self.raiz / chave).resolve()
        # Defesa extra: nenhuma chave pode apontar para fora da pasta.
        if not caminho.is_relative_to(self.raiz.resolve()):
            raise ValueError(f"Chave inválida: {chave}")
        return caminho

    def guardar(self, chave: str, dados: bytes) -> None:
        destino = self._caminho(chave)
        destino.parent.mkdir(parents=True, exist_ok=True)
        # Escreve ao lado e troca de uma vez: ninguém lê um arquivo pela metade.
        parcial = destino.with_name(destino.name + ".parcial")
        parcial.write_bytes(dados)
        os.replace(parcial, destino)

    def ler(self, chave: str) -> bytes:
        try:
            return self._caminho(chave).read_bytes()
        except FileNotFoundError as erro:
            raise ArquivoAusente(chave) from erro

    def apagar(self, chave: str) -> None:
        caminho = self._caminho(chave)
        caminho.unlink(missing_ok=True)
        # Remove pastas que ficaram vazias, sem nunca subir acima da raiz.
        pasta = caminho.parent
        while pasta != self.raiz.resolve() and pasta.is_dir() and not any(pasta.iterdir()):
            pasta.rmdir()
            pasta = pasta.parent
