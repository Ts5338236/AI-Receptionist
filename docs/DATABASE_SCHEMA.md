# Database Schema Documentation

## Database Engine
- **Engine**: PostgreSQL 16
- **Driver**: `asyncpg` (Async SQLAlchemy 2.0)
- **Migrations**: Alembic

---

## Tables & Schema Dictionary

### 1. `tenants`
The top-level enterprise organization.
- `id` (UUID, Primary Key)
- `name` (VARCHAR(255), Not Null)
- `slug` (VARCHAR(100), Unique Index)
- `plan_tier` (VARCHAR(50), Default: 'enterprise')
- `settings` (JSONB, Default: '{}')
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `buildings`
Physical office campuses or facilities associated with a tenant.
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> `tenants.id` ON DELETE CASCADE)
- `name` (VARCHAR(255), Not Null)
- `address` (VARCHAR(500), Nullable)
- `timezone` (VARCHAR(100), Default: 'UTC')
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 3. `kiosk_devices`
Physical touchscreen hardware terminals deployed on premise.
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> `tenants.id` ON DELETE CASCADE)
- `building_id` (UUID, Foreign Key -> `buildings.id` ON DELETE SET NULL)
- `device_code` (VARCHAR(100), Unique Index)
- `name` (VARCHAR(255), Not Null)
- `hardware_serial` (VARCHAR(255), Nullable)
- `ip_address` (VARCHAR(45), Nullable)
- `status` (VARCHAR(50), Default: 'offline')
- `capabilities` (JSONB, Default: '{}')
- `last_heartbeat_at` (TIMESTAMPTZ, Nullable)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 4. `visitors`
Visitor profiles supporting returning visitor recognition.
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> `tenants.id` ON DELETE CASCADE)
- `full_name` (VARCHAR(255), Not Null, Index)
- `email` (VARCHAR(255), Nullable, Index)
- `phone` (VARCHAR(50), Nullable, Index)
- `company` (VARCHAR(255), Nullable)
- `is_vip` (BOOLEAN, Default: false)
- `custom_fields` (JSONB, Default: '{}')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 5. `visitor_sessions`
Check-in occurrences and interactions logged at a kiosk.
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> `tenants.id` ON DELETE CASCADE)
- `visitor_id` (UUID, Foreign Key -> `visitors.id` ON DELETE CASCADE)
- `kiosk_device_id` (UUID, Foreign Key -> `kiosk_devices.id` ON DELETE SET NULL)
- `host_name` (VARCHAR(255), Not Null)
- `host_email` (VARCHAR(255), Nullable)
- `host_notified` (BOOLEAN, Default: false)
- `purpose_of_visit` (VARCHAR(255), Not Null)
- `badge_printed` (BOOLEAN, Default: false)
- `checkin_status` (VARCHAR(50), Default: 'checked_in')
- `checkin_time` (TIMESTAMPTZ, Not Null)
- `checkout_time` (TIMESTAMPTZ, Nullable)
- `session_metadata` (JSONB, Default: '{}')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 6. `audit_logs`
Compliance and security event logging.
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> `tenants.id` ON DELETE SET NULL)
- `actor_type` (VARCHAR(50), Not Null)
- `actor_id` (VARCHAR(255), Not Null)
- `action` (VARCHAR(100), Not Null, Index)
- `resource_type` (VARCHAR(100), Not Null, Index)
- `resource_id` (VARCHAR(255), Nullable)
- `changes` (JSONB, Default: '{}')
- `ip_address` (VARCHAR(45), Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Index)
