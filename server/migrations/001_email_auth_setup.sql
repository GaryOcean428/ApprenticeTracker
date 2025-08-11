-- Migration: Email-based authentication setup
-- This migration ensures the users table has proper email indexing and constraints

-- Create users table if it doesn't exist (should already exist from schema)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'user',
    role_id INTEGER REFERENCES roles(id),
    organization_id INTEGER,
    profile_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT,
    subscription_plan_id INTEGER,
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure email constraint is case-insensitive unique
-- Note: PostgreSQL UNIQUE constraints are case-sensitive by default
-- We handle case-insensitive uniqueness in application logic

-- Add some comments
COMMENT ON TABLE users IS 'User accounts with email-based authentication';
COMMENT ON COLUMN users.email IS 'Primary identifier for authentication (case-insensitive)';
COMMENT ON COLUMN users.username IS 'Display name/username (kept for compatibility)';
COMMENT ON INDEX idx_users_email_lower IS 'Case-insensitive email lookup index';