-- Create enum for connection status
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('active', 'expired', 'revoked', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table for Google Sheets connections
CREATE TABLE IF NOT EXISTS google_sheets_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_email TEXT NOT NULL,
    account_name TEXT,
    project_name TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/spreadsheets.readonly',
    status connection_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure one connection per account per user
    UNIQUE(user_id, account_email)
);

-- Enable RLS
ALTER TABLE google_sheets_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON google_sheets_connections;

-- Create RLS policies
CREATE POLICY "Users can view their own connections" ON google_sheets_connections
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" ON google_sheets_connections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON google_sheets_connections
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON google_sheets_connections
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_sheets_connections_user_id ON google_sheets_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_connections_status ON google_sheets_connections(status);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_google_sheets_connections_updated_at ON google_sheets_connections;

-- Create trigger for updating updated_at
CREATE TRIGGER update_google_sheets_connections_updated_at
    BEFORE UPDATE ON google_sheets_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
