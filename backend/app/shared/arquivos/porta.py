"""A "tomada" de arquivos: o que a API precisa para guardar e ler bytes.

Quem usa só conhece este contrato. Se os arquivos estão numa pasta, no Supabase
Storage ou na AWS é decidido em ``criar_armazenamento`` (``__init__.py``).
"""

from typing import Protocol


class ArquivoAusente(Exception):
    """Não existe arquivo com essa chave."""


class ArmazenamentoDeArquivos(Protocol):
    def guardar(self, chave: str, dados: bytes) -> None: ...

    def ler(self, chave: str) -> bytes:
        """Devolve o conteúdo ou levanta ArquivoAusente."""
        ...

    def apagar(self, chave: str) -> None:
        """Apaga se existir (não reclama se já não existe)."""
        ...
