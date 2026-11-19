# AI Receptionist Enterprise - API Specification

## Base URL
`/api/v1`

## Error Response Standard (RFC 7807)
All error responses return `application/problem+json` formatted responses:
```json
{
  "type": "https://api.receptionist.internal/errors/validation_error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The request body failed schema validation.",
  "code": "VALIDATION_ERROR",
  "instance": "/api/v1/tenants/",
  "correlation_id": "c1f7a228-4859-4dbe-a178-55df98b71d9a",
  "details": {
    "validation_errors": [...]
  }
}
```

---

## Endpoints

### 1. Root Discovery
- **Method**: `GET /api/v1/`
- **Response**: `200 OK`
- **Body**:
  ```json
  {
    "name": "AI Receptionist Enterprise",
    "version": "1.0.0",
    "environment": "development",
    "status": "operational",
    "endpoints": { ... }
  }
  ```

### 2. Application Liveness
- **Method**: `GET /api/v1/health/`
- **Response**: `200 OK`
- **Body**:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "development",
    "service": "ai-receptionist-backend"
  }
  ```

### 3. Database Subsystem Health
- **Method**: `GET /api/v1/health/database`
- **Responses**:
  - `200 OK` if database probe succeeds
  - `503 Service Unavailable` if database probe fails
- **Body**:
  ```json
  {
    "name": "postgresql",
    "status": "healthy",
    "latency_ms": 3.42,
    "details": {
      "database": "ai_receptionist",
      "server": "localhost"
    }
  }
  ```

### 4. Redis Subsystem Health
- **Method**: `GET /api/v1/health/redis`
- **Responses**:
  - `200 OK` if Redis PING succeeds
  - `503 Service Unavailable` if Redis connection fails
- **Body**:
  ```json
  {
    "name": "redis",
    "status": "healthy",
    "latency_ms": 1.15,
    "details": {
      "host": "localhost",
      "port": 6379
    }
  }
  ```

### 5. Multi-Tenant Management
- **Method**: `GET /api/v1/tenants/`
  - Query parameters: `skip` (int), `limit` (int)
  - Returns list of enterprise tenants
- **Method**: `POST /api/v1/tenants/`
  - Request Body: `TenantCreate`
  - Returns: `201 Created`
