# AI Receptionist Enterprise - System Architecture

## Overview
The AI Receptionist Enterprise platform provides a physical virtual receptionist kiosk backed by a realistic AI digital human. The solution welcomes visitors, communicates via natural language voice, responds to inquiries regarding company policy, manages check-in operations, and alerts host employees via Slack, Teams, Email, and SMS.

---

## Architectural Principles
1. **Resilience & Fault Tolerance**: Kiosk terminals must continue basic UI rendering and local fallback operation even in transient network downtime.
2. **Multi-Tenancy by Design**: All database tables, audit logs, and kiosk sessions are strictly scoped by `tenant_id`.
3. **Async Core**: Fast API responses with sub-10ms baseline overhead using async SQLAlchemy 2.0 and asyncpg connection pooling.
4. **Hardware & Edge Ready**: Touch-screen optimized UI with large tactile targets, zero scrollbars, and high-DPI full-screen support.
5. **Observability**: Structured JSON logging, `X-Correlation-ID` header tracing across all requests, and dedicated `/health` probes.

---

## Component Topology

```
                  ┌──────────────────────────────────────────────┐
                  │          Touchscreen Kiosk Client            │
                  │   Next.js 16 (App Router) + Tailwind + Shadcn │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTP / WebSocket
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │              Ingress / API Gateway           │
                  │           Nginx / AWS ALB / Traefik          │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             FastAPI Backend Core             │
                  │            Versioned /api/v1 Routes          │
                  │   Structured JSON Logger + Error Handler     │
                  └──────────┬───────────────────┬───────────────┘
                             │                   │
             ┌───────────────┴────────┐          │
             ▼                        ▼          ▼
    ┌────────────────┐       ┌─────────────┐   ┌────────────────┐
    │ PostgreSQL 16  │       │  Redis 7.2  │   │     Qdrant     │
    │  Async Engine  │       │Session/Cache│   │ Vector Search  │
    └────────────────┘       └─────────────┘   └────────────────┘
```

---

## Health Probe Specification
- `GET /api/v1/`: Root API metadata and service directory.
- `GET /api/v1/health/`: Immediate liveness check for container orchestration.
- `GET /api/v1/health/database`: Performs active `SELECT 1` against PostgreSQL with latency tracking.
- `GET /api/v1/health/redis`: Performs `PING` command against Redis cluster/instance.
