# Application Security & Multi-Tenant Isolation Guidelines

## 1. Security Architecture Principles

### Zero-Trust Tenant Resolution
Client-supplied tenant identifiers in headers (`X-Tenant-ID`) or request bodies are **never** trusted without cryptographic validation. All tenant contexts are extracted directly from cryptographically signed JWT access tokens verified with `SECRET_KEY`.

---

## 2. Authentication & Credential Storage

### Password Hashing
- Plaintext passwords are **never** persisted or logged.
- Passwords are salted and hashed using `bcrypt` (work factor: 12 rounds).
- Password validation rejects entries shorter than 8 characters.

### JWT Token Lifecycle
- **Access Tokens**: Short-lived (30 minutes), signed with `HS256`, containing `sub` (user UUID), `tenant_id`, and `roles`.
- **Refresh Tokens**: Longer-lived (7 days), strictly validated during rotation to prevent replay attacks.
- **Revocation**: Logging out marks sessions invalid in cache/audit records.

---

## 3. Multi-Tenant Authorization & Row-Level Security (RLS)

### Isolation Rules
1. Every query accessing tenant-owned resources (`users`, `branches`, `kiosks`, `visitors`, `visitor_sessions`) must include explicit filtering on `tenant_id`.
2. Direct object references (`GET /api/v1/tenants/{tenant_id}`) verify that the caller's authorized tenant matches the target resource or that the caller holds `SUPER_ADMIN`. Cross-tenant requests receive an immediate `403 Forbidden`.

### Role-Based Access Control (RBAC)
| Role | Scope | Capabilities |
|---|---|---|
| `SUPER_ADMIN` | Platform-wide | Manage all tenants, global platform telemetry, system migrations |
| `BUSINESS_ADMIN` | Tenant | Manage tenant settings, invite users, view all branches |
| `BRANCH_ADMIN` | Branch | Manage branch devices, local visitor logs, staff assignments |
| `RECEPTIONIST` | Terminal / Lobby | Assist visitors, check-in arrivals, trigger badge printing |
| `EMPLOYEE` | Individual | View personal visits, receive host arrival notifications |

---

## 4. Input Validation & Error Masking
- All inputs are strictly sanitized and parsed using Pydantic v2 schemas.
- Centralized exception handlers conform to **RFC 7807 (Problem Details for HTTP APIs)**.
- Internal database error traces (`asyncpg`, `psycopg2`, `SQLAlchemy`) are intercepted and masked from API responses in production mode to prevent information disclosure.
- Request correlation IDs (`X-Correlation-ID`) are injected into all error responses to facilitate audit trails without exposing stack traces.
