-- Migration: Add username and password columns to users table
-- Safe for existing data with nulls

BEGIN;

-- Step 1: Add columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Step 2: Migrate existing data from legacy columns
UPDATE users
SET password = password_hash
WHERE password IS NULL AND password_hash IS NOT NULL;

UPDATE users
SET username = email
WHERE username IS NULL AND email IS NOT NULL;

-- Step 3: Fill remaining nulls with safe defaults
UPDATE users
SET password = 'changeme'
WHERE password IS NULL;

UPDATE users
SET username = 'anonymous'
WHERE username IS NULL;

-- Step 4: Set default values for future inserts
ALTER TABLE users ALTER COLUMN password SET DEFAULT 'changeme';
ALTER TABLE users ALTER COLUMN username SET DEFAULT 'anonymous';

-- Step 5: Enforce NOT NULL constraints
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Step 6: Add uniqueness constraint on username (optional but recommended)
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Step 7: Drop deprecated column if no longer needed
-- ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

COMMIT;