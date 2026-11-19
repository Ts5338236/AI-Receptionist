# Development Setup Guide

## 1. Prerequisites
- **Python**: 3.12+
- **Node.js**: 20+ (optional for local frontend execution outside Docker)
- **Docker & Docker Compose**: v2.20+
- **Git**

---

## 2. Environment Configuration
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```

Review environment defaults:
```ini
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ai_receptionist
REDIS_URL=redis://localhost:6379/0
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

---

## 3. Starting Infrastructure Services
Start the supporting services (PostgreSQL 16, Redis 7.2, and Qdrant) via Docker Compose:
```bash
cd infra
docker compose up -d postgres redis qdrant
```

Verify service health:
```bash
docker compose ps
```

---

## 4. Backend Setup & Local Run

1. Navigate to `backend/` and initialize virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt -r requirements-dev.txt
   ```

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. Start FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger documentation.

---

## 5. Frontend Setup & Local Run

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser:
   - `/kiosk` - Fullscreen Touchscreen Kiosk Interface
   - `/dashboard` - Real-Time Visitor Dashboard
   - `/admin` - Kiosk Terminal Fleet Management
   - `/settings` - Enterprise Configuration & Voice Greetings
   - `/login` - Authentication Portal

---

## 6. Running Automated Tests
```bash
cd backend
pytest -v
```
To run tests with code coverage:
```bash
pytest --cov=app --cov-report=term-missing
```
