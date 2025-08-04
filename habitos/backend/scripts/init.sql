-- =============================================================================
-- HabitOS Database Initialization Script
-- =============================================================================
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create additional indexes for better performance (if needed)
-- These will be created by Alembic migrations, but we can add some here for optimization

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE habitos TO habitos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habitos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habitos_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habitos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habitos_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'HabitOS database initialized successfully at %', NOW();
END $$; 