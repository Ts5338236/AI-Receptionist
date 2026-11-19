# API Documentation: AI Receptionist Enterprise Core

## Base URL
`/api/v1`

---

## Centralized Error Model (RFC 7807)
All errors return the `application/problem+json` content type:
```json
{
  "type": "https://api.receptionist.internal/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid corporate email or password",
  "code": "UNAUTHORIZED",
  "instance": "/api/v1/auth/login",
  "correlation_id": "c1f7a228-4859-4dbe-a178-55df98b71d9a"
}
```

---

## 1. System Discovery & Subsystem Health Endpoints

### `GET /api/v1/`
Returns service metadata, versioning, and endpoint directories.

### `GET /api/v1/health/`
Liveness probe returning `200 OK` when the FastAPI application is serving traffic.

### `GET /api/v1/health/database`
Probes PostgreSQL connectivity via active `SELECT 1`.
- `200 OK`: Database connected (includes response latency in milliseconds).
- `503 Service Unavailable`: Connection error or database unreachable.

### `GET /api/v1/health/redis`
Probes Redis cache and session broker via `PING`.
- `200 OK`: Redis operational (includes response latency in milliseconds).
- `503 Service Unavailable`: Connection refused or socket timeout.

### `GET /api/v1/health/qdrant`
Probes Qdrant vector database connectivity.
- `200 OK`: Qdrant operational (returns collection counts).
- `503 Service Unavailable`: Qdrant cluster unreachable.

---

## 2. Authentication & Token Lifecycle Endpoints

### `POST /api/v1/auth/register`
Provisions a new enterprise tenant organization and creates its initial `BUSINESS_ADMIN` user.
- **Request Body**:
  ```json
  {
    "email": "admin@enterprise.ai",
    "password": "SecurePassword123!",
    "full_name": "Jane Administrator",
    "tenant_name": "Enterprise AI Systems",
    "tenant_slug": "enterprise-ai"
  }
  ```
- **Response**: `201 Created` with JWT access and refresh token pair.

### `POST /api/v1/auth/login`
Authenticates corporate credentials and returns active session tokens.
- **Response**: `200 OK` with access token (30-minute validity) and refresh token (7-day validity).

### `POST /api/v1/auth/refresh`
Rotates refresh token and returns fresh session tokens.

### `POST /api/v1/auth/logout`
Invalidates active session.

### `GET /api/v1/auth/me`
Retrieves identity, tenant assignment, and assigned roles for the bearer token.

---

## 3. Multi-Tenant Organization Endpoints

### `GET /api/v1/tenants/me`
Retrieves details of the caller's authorized tenant.

### `GET /api/v1/tenants/{tenant_id}`
Retrieves a tenant by UUID. Enforces tenant boundary isolation (raises `403 Forbidden` if caller attempts cross-tenant access without `SUPER_ADMIN`).

### `POST /api/v1/tenants/`
Provisions a new tenant (Restricted to `SUPER_ADMIN`).

---

## 4. User Management Endpoints

### `GET /api/v1/users/me`
Alias returning the current user profile.

### `GET /api/v1/users/`
Lists users strictly scoped within the authenticated caller's tenant.

### `POST /api/v1/users/`
Creates a new user within the authenticated tenant context and assigns RBAC roles.
