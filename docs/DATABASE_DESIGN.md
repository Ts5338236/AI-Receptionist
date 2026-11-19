# Database Design & Multi-Tenant Schema Specification

## 1. Engine & Connectivity
- **RDBMS**: PostgreSQL 16
- **ORM**: SQLAlchemy 2.0 (AsyncIO)
- **Driver**: `asyncpg` (Async engine) and `psycopg2-binary` (Synchronous Alembic engine)
- **Connection Pool**: `QueuePool` with `pool_size=10`, `max_overflow=20`, `pool_timeout=30`, `pool_pre_ping=True`

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    TENANTS ||--o{ BRANCHES : contains
    TENANTS ||--o{ TENANT_SETTINGS : configures
    TENANTS ||--o{ USERS : employs
    TENANTS ||--o{ KIOSK_DEVICES : operates
    TENANTS ||--o{ VISITORS : registers
    TENANTS ||--o{ AUDIT_LOGS : tracks
    BRANCHES ||--o{ KIOSK_DEVICES : houses
    BRANCHES ||--o{ USERS : assigns
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : grants
    ROLES ||--o{ ROLE_PERMISSIONS : includes
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : enables
    VISITORS ||--o{ VISITOR_SESSIONS : attends
    KIOSK_DEVICES ||--o{ VISITOR_SESSIONS : processes

    TENANTS {
        uuid id PK
        string name
        string slug UK
        string plan_tier
        jsonb settings
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    BRANCHES {
        uuid id PK
        uuid tenant_id FK
        string name
        string code
        string address
        string timezone
        boolean is_active
    }

    USERS {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        boolean is_superuser
    }

    ROLES {
        uuid id PK
        string name UK
        string description
        boolean is_system_role
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
    }

    TENANT_SETTINGS {
        uuid id PK
        uuid tenant_id FK
        string key
        jsonb value
        boolean is_encrypted
    }

    AUDIT_LOGS {
        uuid id PK
        uuid tenant_id FK
        string actor_type
        string actor_id
        string action
        string resource_type
        jsonb changes
        timestamp created_at
    }
```

---

## 3. Data Dictionary

### `tenants`
Root organizational boundary for multi-tenancy.
- `id` (UUID, PK): Unique tenant ID.
- `name` (VARCHAR(255)): Official organization name.
- `slug` (VARCHAR(100), UNIQUE): URL and subdomain friendly slug.
- `plan_tier` (VARCHAR(50)): Tier (`enterprise`, `business`).
- `settings` (JSONB): Core tenant configuration.
- `is_active` (BOOLEAN): Status flag.

### `branches`
Physical facilities or branches operated by a tenant.
- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> `tenants.id` ON DELETE CASCADE)
- `name` (VARCHAR(255)): Branch name (e.g. "HQ Tower A", "London Office").
- `code` (VARCHAR(50)): Unique code within tenant.
- `timezone` (VARCHAR(100)): Local timezone.

### `users`
Authenticated personnel.
- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> `tenants.id` ON DELETE CASCADE)
- `branch_id` (UUID, FK -> `branches.id` ON DELETE SET NULL, Optional)
- `email` (VARCHAR(255), Index): Corporate email.
- `hashed_password` (VARCHAR(255)): Salted bcrypt password hash.
- `full_name` (VARCHAR(255)): User display name.
- `is_active` (BOOLEAN): Account status.

### `roles` & `permissions`
Role-Based Access Control matrix (`SUPER_ADMIN`, `BUSINESS_ADMIN`, `BRANCH_ADMIN`, `RECEPTIONIST`, `EMPLOYEE`).

### `tenant_settings`
Configurable parameters (voice greetings, printer pairing, badge templates).

### `audit_logs`
Append-only log of security, administrative, and kiosk operations for compliance.
