# Atalhos do DataPulse. Rode "make" (ou "make help") para ver a lista.
# Requisitos: Python 3.12+, Node 20+ e bun (npm install -g bun).

VENV := .venv
PY := $(CURDIR)/$(VENV)/bin/python
API_PORT ?= 8000

.DEFAULT_GOAL := help
.PHONY: help setup dev api web test lint format

help: ## Mostra os comandos disponíveis
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-8s %s\n", $$1, $$2}'

setup: ## Instala tudo (ambiente Python da API e pacotes do Frontend)
	test -d $(VENV) || python3 -m venv $(VENV)
	$(PY) -m pip install -q -r backend/requirements-dev.txt
	cd Frontend && bun install --frozen-lockfile
	test -f Frontend/.env.local || cp Frontend/.env.example Frontend/.env.local

dev: ## Sobe API e Frontend juntos (Ctrl+C encerra os dois)
	$(MAKE) -j2 api web

api: ## Sobe só a API em http://localhost:8000/docs
	cd backend && $(PY) -m uvicorn app.main:app --reload --port $(API_PORT)

web: ## Sobe só o Frontend (o endereço aparece no terminal)
	cd Frontend && bun run dev

test: ## Roda os testes da API e do Frontend
	cd backend && $(PY) -m pytest -q
	cd Frontend && bun run test

lint: ## Confere a qualidade do código (ruff na API, eslint no Frontend)
	cd backend && $(PY) -m ruff check . && $(PY) -m ruff format --check .
	cd Frontend && bun run lint

format: ## Formata o código da API automaticamente
	cd backend && $(PY) -m ruff format . && $(PY) -m ruff check --fix .
