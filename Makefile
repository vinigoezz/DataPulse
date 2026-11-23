# Atalhos do DataPulse. Rode "make" (ou "make help") para ver a lista.
# Requisitos: Python 3.12+, Node 20+ e bun (npm install -g bun).

VENV := .venv
PY := $(CURDIR)/$(VENV)/bin/python
API_PORT ?= 8000

.DEFAULT_GOAL := help
.PHONY: help setup dev api web test test-integracao servicos servicos-parar migrar render-segredos lint format

help: ## Mostra os comandos disponíveis
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-16s %s\n", $$1, $$2}'

setup: ## Instala tudo (ambiente Python da API e pacotes do Frontend)
	test -d $(VENV) || python3 -m venv $(VENV)
	$(PY) -m pip install -q -r backend/requirements-dev.txt
	cd Frontend && bun install --frozen-lockfile
	test -f Frontend/.env.local || cp Frontend/.env.example Frontend/.env.local
	test -f backend/.env || cp backend/.env.example backend/.env

dev: ## Sobe API e Frontend juntos (Ctrl+C encerra os dois)
	$(MAKE) -j2 api web

api: ## Sobe só a API em http://localhost:8000/docs
	cd backend && $(PY) -m uvicorn app.main:app --reload --port $(API_PORT)

web: ## Sobe só o Frontend (o endereço aparece no terminal)
	cd Frontend && bun run dev

test: ## Roda os testes da API e do Frontend
	cd backend && $(PY) -m pytest -q
	cd Frontend && bun run test

# Endereços dos serviços do docker-compose.yml (só existem no seu computador).
TESTE_NUVEM := DATAPULSE_TEST_DATABASE_URL=postgresql://datapulse:datapulse@localhost:54329/datapulse \
	DATAPULSE_TEST_S3_ENDPOINT=http://localhost:9090 DATAPULSE_TEST_S3_BUCKET=datapulse-testes \
	DATAPULSE_TEST_S3_ACCESS_KEY=teste DATAPULSE_TEST_S3_SECRET_KEY=teste

test-integracao: servicos ## Roda os testes da API também contra Postgres e S3 (precisa de Docker)
	cd backend && $(TESTE_NUVEM) $(PY) -m pytest -q

servicos: ## Sobe Postgres e S3 locais no Docker
	docker compose up -d --wait

servicos-parar: ## Desliga os serviços do Docker
	docker compose down

migrar: ## Prepara o banco e o bucket configurados em backend/.env (cria tabelas que faltam)
	cd backend && $(PY) -m app.preparar

render-segredos: ## Testa os segredos do backend/.env e, se funcionarem, envia ao Render e faz deploy
	cd backend && $(PY) -m scripts.render_segredos

lint: ## Confere a qualidade do código (ruff na API, eslint no Frontend)
	cd backend && $(PY) -m ruff check . && $(PY) -m ruff format --check .
	cd Frontend && bun run lint

format: ## Formata o código da API automaticamente
	cd backend && $(PY) -m ruff format . && $(PY) -m ruff check --fix .
