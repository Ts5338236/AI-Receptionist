# AI Receptionist Enterprise

Enterprise physical touchscreen kiosk featuring a realistic AI digital human that welcomes visitors, communicates through voice, answers company questions, manages visitor registration, and performs authorized reception operations.

---

## Technical Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI primitives
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, Alembic
- **Database & Cache**: PostgreSQL 16 (Async / Multi-Tenant), Redis 7.2, Qdrant Vector Search
- **Infrastructure**: Docker, Docker Compose, AWS Cloud Ready

---

## Directory Layout

```text
├── backend/            # FastAPI async service, ORM models, Alembic, tests
├── frontend/           # Next.js 16 kiosk, dashboard, admin, and login routes
├── infra/              # Docker Compose (Postgres, Redis, Qdrant, backend, frontend)
├── docs/               # Architecture, API specifications, and database schema docs
├── scripts/            # Bootstrap and test automation scripts
├── .env.example        # Environment configuration template
└── Makefile            # Standard development shortcuts
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 20+ (optional for local non-Docker frontend runs)
- Docker & Docker Compose

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Running via Docker Compose
To launch the entire platform with PostgreSQL, Redis, Qdrant, FastAPI backend, and Next.js frontend:
```bash
cd infra
docker compose up -d
```

### 4. Running the Backend Locally
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### 5. Running the Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- `/kiosk` - Fullscreen Touchscreen AI Virtual Receptionist Welcome Screen
- `/dashboard` - Visitor Management & Live Check-in Metrics
- `/admin` - Kiosk Terminal Fleet Management
- `/login` - Enterprise Authentication Portal

---

## Running Automated Tests

Run backend async unit and integration tests:
```bash
cd backend
pytest -v
```

---

## API Health Check Probes
- `GET http://localhost:8000/api/v1/` - API Root Discovery
- `GET http://localhost:8000/api/v1/health/` - Liveness Probe
- `GET http://localhost:8000/api/v1/health/database` - PostgreSQL Probe
- `GET http://localhost:8000/api/v1/health/redis` - Redis Probe
