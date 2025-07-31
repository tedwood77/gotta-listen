-- Add password hash column
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing users with a default hash (for development only)
-- In production, you'd want to force users to reset their passwords
UPDATE users SET password_hash = '$2b$12$LQv3c1yqBwlFdYc1O2QWGOIqjrwjFNdrhHlgp5KjMQGQXU8zU8zU8' WHERE password_hash IS NULL;
