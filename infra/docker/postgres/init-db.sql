-- AI Receptionist Enterprise Initial Database Setup
-- Enables UUID generation and sets up default database structures

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_receptionist TO postgres;
