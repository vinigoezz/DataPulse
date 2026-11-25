"""Feature: datasets (planilhas importadas).

Cada subpasta é uma fatia (vertical slice) com sua rota e sua regra:
importar, listar, obter, remover, linhas, estatisticas e agregar.
Os arquivos soltos aqui (models, errors, repository, dependencies) são o que as fatias dividem.
"""

from fastapi import APIRouter

from app.features.datasets.agregar.endpoint import router as agregar
from app.features.datasets.estatisticas.endpoint import router as estatisticas
from app.features.datasets.importar.endpoint import router as importar
from app.features.datasets.linhas.endpoint import router as linhas
from app.features.datasets.listar.endpoint import router as listar
from app.features.datasets.obter.endpoint import router as obter
from app.features.datasets.remover.endpoint import router as remover

router = APIRouter(tags=["datasets"])
for fatia in (listar, importar, obter, remover, linhas, estatisticas, agregar):
    router.include_router(fatia, prefix="/datasets")

__all__ = ["router"]
