"""POST /api/datasets/upload: recebe um CSV (ou .zip/.gz) e cria um dataset."""

from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile, status

from app.features.datasets.dependencies import RepositorioDep, SettingsDep
from app.features.datasets.importar.caso_de_uso import PedidoDeImportacao, importar_dataset
from app.features.datasets.models import Dataset

router = APIRouter()


@router.post("/upload", response_model=Dataset, status_code=status.HTTP_201_CREATED)
def importar(
    repositorio: RepositorioDep,
    settings: SettingsDep,
    file: Annotated[UploadFile, File(description="CSV, ou .zip/.gz com um único CSV")],
    description: Annotated[str, Form()] = "",
    separator: Annotated[str | None, Form(description="Detectado se omitido")] = None,
    encoding: Annotated[str | None, Form(description="Detectado se omitido")] = None,
) -> Dataset:
    pedido = PedidoDeImportacao(
        arquivo=file.file,
        nome_arquivo=file.filename or "arquivo.csv",
        descricao=description,
        # Campo de formulário vazio ("") conta como "detectar automaticamente".
        separador=separator or None,
        encoding=encoding or None,
    )
    return importar_dataset(pedido, repositorio, settings.max_upload_mb)
