# A API empacotada: roda igual no Render, Railway, Fly.io, Google Cloud Run ou num servidor.
# Build:  docker build -t datapulse-api backend/
# Rodar:  docker run -p 8000:8000 --env-file backend/.env datapulse-api
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv

# Dependências antes do código: mudar o código não reinstala tudo.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app
COPY migrations ./migrations

# Não roda como administrador.
RUN useradd --create-home api
USER api

EXPOSE 8000
# A maioria das hospedagens informa a porta pela variável PORT.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
