.PHONY: help infra-up infra-down backend-test backend-dev frontend-dev

help:
	@echo "Available commands:"
	@echo "  make infra-up      - Start Postgres, Redis, and Qdrant in Docker"
	@echo "  make infra-down    - Stop and remove infrastructure containers"
	@echo "  make backend-test  - Run backend unit and integration tests"
	@echo "  make backend-dev   - Start FastAPI development server"
	@echo "  make frontend-dev  - Start Next.js development server"

infra-up:
	cd infra && docker compose up -d postgres redis qdrant

infra-down:
	cd infra && docker compose down

backend-test:
	cd backend && pytest -v

backend-dev:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend-dev:
	cd frontend && npm run dev
