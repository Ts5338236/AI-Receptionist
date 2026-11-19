# AI Receptionist Enterprise
## Physical AI Virtual Receptionist Kiosk

Enterprise physical touchscreen kiosk featuring an intelligent AI virtual receptionist that welcomes visitors, communicates through multimodal interfaces, provides employee directory lookups, facilitates office wayfinding, registers visitor arrivals, and coordinates corporate reception operations.

---

## 1. Technical Stack

- **Frontend**: Next.js 15/16 (App Router), React 19, TypeScript 5, Tailwind CSS, Framer Motion, Lucide Icons, React Hook Form, Zod
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, Alembic
- **Database & Cache**: PostgreSQL 16 (Multi-Tenant IAM Schema), Redis 7.2, Qdrant Vector Store
- **Infrastructure**: Docker, Docker Compose, AWS Cloud Ready

---

## 2. Platform Status & Development Roadmap

| Phase | Description | Status | Verification Summary |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Enterprise Foundation, Multi-Tenant IAM, Probes & Alembic | **COMPLETED & VERIFIED** | 20/20 Backend Pytest tests passing |
| **Phase 2** | Enterprise Touchscreen Kiosk Frontend & Interaction Foundation | **COMPLETED & VERIFIED** | 45/45 Frontend tests passing, 18/18 static pages generated |
| **Phase 3** | Digital Human 3D Avatar & Live Audio Streaming (WebRTC) | *Scheduled Next* | WebRTC mount points prepared in DOM |
| **Phase 4** | Real-Time Speech Recognition & Voice Pipeline | *Scheduled* | Voice state machine prepared |
| **Phase 5–15**| Enterprise RAG, Analytics, Visitor Badging & Hardware Orchestration | *Scheduled* | |

---

## 3. Directory Layout

```text
├── backend/            # FastAPI async service, SQLAlchemy ORM models, Alembic, tests
├── frontend/           # Next.js 15/16 App Router kiosk frontend
│   ├── src/
│   │   ├── app/        # Kiosk routes, admin dashboards, login, and root splash
│   │   ├── components/ # Modular avatar subsystem, kiosk organisms, and UI design tokens
│   │   ├── context/    # LanguageProvider (en/hi) & AccessibilityProvider (WCAG)
│   │   ├── hooks/      # Inactivity detection & session purge (useKioskSession)
│   │   └── services/   # Typed API services & central HTTP client (RFC 7807)
│   └── tests/          # Automated frontend contract & integrity tests
├── infra/              # Docker Compose (PostgreSQL, Redis, Qdrant, backend, frontend)
├── docs/               # Architecture, Design System, Components, API, and Completion Reports
├── scripts/            # Bootstrap and test automation scripts
├── .env.example        # Environment configuration template
└── Makefile            # Standard development shortcuts
```

---

## 4. Kiosk Route Architecture

Public touchscreen visitors interact exclusively with the optimized `(kiosk)` routes:

| Route Path | Description | Key Features |
| :--- | :--- | :--- |
| `/kiosk` | Primary Welcome Screen | Digital human avatar, quick actions, footer controls, telemetry banner. |
| `/kiosk/welcome` | Welcome Alias Route | Identical to `/kiosk`. |
| `/kiosk/assistant` | Multimodal AI Assistant | Split-screen avatar stage, transcript stream, microphone toggle, text fallback. |
| `/kiosk/visitor-check-in` | Visitor Registration Flow | 2-step registration form (RHF + Zod) and visual thermal badge preview. |
| `/kiosk/appointments` | Appointment & QR Scanner | Search bookings by code/phone and optical QR code camera viewfinder. |
| `/kiosk/employee-directory` | Staff Directory & Alerting | Search by name/department, status badges, and "Notify Host" triggers. |
| `/kiosk/department-navigation`| Office Wayfinding & Maps | Master-detail floor explorer, meeting room list, and walking directions. |
| `/kiosk/assistance` | Facilities & Human Concierge | Paging dispatch, guest Wi-Fi credentials, cafeteria, security helpline. |
| `/kiosk/privacy` | Kiosk Privacy & Compliance | Zero ambient recording disclosure, 60–90s auto-purge, SOC2/GDPR info. |

---

## 5. Development & Testing Commands

### Prerequisites
- Python 3.12+ (Backend)
- Node.js 20+ & npm 10+ (Frontend)
- Docker & Docker Compose

### Running the Frontend
```bash
cd frontend
npm run dev
# Kiosk accessible at: http://localhost:3000/kiosk
```

### Running Frontend Tests & Verification
```bash
cd frontend
# 1. Strict TypeScript compilation check (0 errors)
npx tsc --noEmit

# 2. Automated Frontend contract & integrity tests (45 tests)
npm run test

# 3. Next.js production build (18 static pages)
npm run build
```

### Running Backend Tests
```bash
cd backend
python -m pytest -v
# 20 tests passed
```

---

## 6. Phase Documentation Suite

Comprehensive technical reports and specifications are maintained in the [`docs/`](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/) directory:
- [PHASE_2_COMPLETION_REPORT.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_COMPLETION_REPORT.md) - Master 22-step Requirement Traceability Matrix & Audit
- [PHASE_2_ARCHITECTURE.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_ARCHITECTURE.md) - Frontend System Architecture & Session Security
- [PHASE_2_DESIGN_SYSTEM.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_DESIGN_SYSTEM.md) - Design Tokens, Touch Ergonomics & Responsive Breakpoints
- [PHASE_2_COMPONENTS.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_COMPONENTS.md) - Component Catalog (Avatar Subsystem, UI Tokens, Kiosk Organisms)
- [PHASE_2_API_INTEGRATION.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_API_INTEGRATION.md) - Typed API Service Contracts & Integration Hooks
- [PHASE_2_TESTING_REPORT.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_TESTING_REPORT.md) - Full Stack Automated Test & Build Evidence
- [PHASE_2_INITIAL_AUDIT.md](file:///c:/Users/sony/Desktop/AI%20Receptionist/docs/PHASE_2_INITIAL_AUDIT.md) - Pre-implementation Repository Audit

---

## 7. Strict Phase Boundaries

In compliance with the project architecture roadmap:
- **Phase 3 (3D Digital Human Avatar & Live Audio Streaming via WebRTC)** has not been started. The DOM currently exposes mount points (`#phase3-digital-human-mount`) for video tracks.
- **Phase 4 (Real-Time Voice Pipeline & Speech Recognition)** has not been started; voice interaction is structured with browser permission states and typed contracts.
- **Zero Fake Integrations:** All business operations display prototype and staging disclosures; no fake successful operations are claimed.
