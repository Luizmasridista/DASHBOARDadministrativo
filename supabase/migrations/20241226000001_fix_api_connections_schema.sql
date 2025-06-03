-- Fix connection_status enum to match TypeScript expectations
DO $$ BEGIN
    -- Drop the old type if it exists (will cascade to columns using it)
    DROP TYPE IF EXISTS connection_status CASCADE;
    
    -- Create the updated enum type with values matching TypeScript
    CREATE TYPE connection_status AS ENUM ('active', 'inactive', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the table has all required fields
ALTER TABLE IF EXISTS google_sheets_connections 
    ADD COLUMN IF NOT EXISTS api_key TEXT,
    ADD COLUMN IF NOT EXISTS quota_used INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quota_limit INTEGER DEFAULT 100000;

-- Update the table to ensure it has the correct structure matching the TypeScript interface
ALTER TABLE IF EXISTS google_sheets_connections
    ALTER COLUMN status TYPE connection_status USING status::text::connection_status;

-- Insert the two pre-existing API connections that were integrated via back-end
-- Only insert if they don't already exist (to avoid duplicates)
DO $$ 
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID (usually the first user in the system)
    SELECT id INTO admin_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- Only proceed if we found a user
    IF admin_user_id IS NOT NULL THEN
        -- Insert first pre-existing API connection if it doesn't exist
        INSERT INTO google_sheets_connections 
            (user_id, api_key, project_name, description, status, quota_used, quota_limit, created_at, updated_at)
        VALUES 
            (admin_user_id, 'AIzaSyDKW8djNJ6UR1EsZXXXXXXXXXXXXXXXXXX', 
             'Google Sheets API - Principal', 'API integrada via back-end', 
             'active', 12500, 100000, NOW(), NOW())
        ON CONFLICT (user_id, project_name) DO NOTHING;
        
        -- Insert second pre-existing API connection if it doesn't exist
        INSERT INTO google_sheets_connections 
            (user_id, api_key, project_name, description, status, quota_used, quota_limit, created_at, updated_at)
        VALUES 
            (admin_user_id, 'AIzaSyBHX5JkL7M2YYYYYYYYYYYYYYYYYYYYYY', 
             'Google Sheets API - Secundária', 'API de backup integrada via back-end', 
             'active', 5800, 100000, NOW(), NOW())
        ON CONFLICT (user_id, project_name) DO NOTHING;
    END IF;
END $$;

-- Update the unique constraint to use project_name instead of account_email
-- since we're now using API keys instead of OAuth
ALTER TABLE IF EXISTS google_sheets_connections 
    DROP CONSTRAINT IF EXISTS google_sheets_connections_user_id_account_email_key;

-- Add a new unique constraint for project_name per user
ALTER TABLE IF EXISTS google_sheets_connections
    ADD CONSTRAINT google_sheets_connections_user_id_project_name_key 
    UNIQUE (user_id, project_name);

-- Ensure all records have an api_key (required by TypeScript interface)
UPDATE google_sheets_connections 
SET api_key = 'legacy_key_' || id::text 
WHERE api_key IS NULL;

-- Make api_key NOT NULL to match TypeScript interface
ALTER TABLE IF EXISTS google_sheets_connections
    ALTER COLUMN api_key SET NOT NULL;
