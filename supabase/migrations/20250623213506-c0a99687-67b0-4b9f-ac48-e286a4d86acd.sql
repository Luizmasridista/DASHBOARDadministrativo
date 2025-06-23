
-- Phase 1: Secure API Key Storage and Database Security (Fixed Version)

-- 1. Enable RLS on critical tables (only if not already enabled)
DO $$ 
BEGIN
    -- Enable RLS on tables that don't have it yet
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'receitas') THEN
        ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'despesas') THEN
        ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'relatorios') THEN
        ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create RLS policies (drop existing ones first to avoid conflicts)
-- Receitas policies
DROP POLICY IF EXISTS "Users can view their own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can insert their own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can update their own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can delete their own receitas" ON receitas;

CREATE POLICY "Users can view their own receitas" ON receitas
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receitas" ON receitas
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receitas" ON receitas
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receitas" ON receitas
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Despesas policies
DROP POLICY IF EXISTS "Users can view their own despesas" ON despesas;
DROP POLICY IF EXISTS "Users can insert their own despesas" ON despesas;
DROP POLICY IF EXISTS "Users can update their own despesas" ON despesas;
DROP POLICY IF EXISTS "Users can delete their own despesas" ON despesas;

CREATE POLICY "Users can view their own despesas" ON despesas
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own despesas" ON despesas
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas" ON despesas
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas" ON despesas
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Relatorios policies
DROP POLICY IF EXISTS "Users can view their own relatorios" ON relatorios;
DROP POLICY IF EXISTS "Users can insert their own relatorios" ON relatorios;
DROP POLICY IF EXISTS "Users can update their own relatorios" ON relatorios;
DROP POLICY IF EXISTS "Users can delete their own relatorios" ON relatorios;

CREATE POLICY "Users can view their own relatorios" ON relatorios
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relatorios" ON relatorios
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relatorios" ON relatorios
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relatorios" ON relatorios
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 3. Secure google_sheets_connections table with proper RLS
DROP POLICY IF EXISTS "Users can view their own sheet connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can insert their own sheet connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can update their own sheet connections" ON google_sheets_connections;
DROP POLICY IF EXISTS "Users can delete their own sheet connections" ON google_sheets_connections;

CREATE POLICY "Users can view their own sheet connections" ON google_sheets_connections
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sheet connections" ON google_sheets_connections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sheet connections" ON google_sheets_connections
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sheet connections" ON google_sheets_connections
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 4. Add encryption support for sensitive data (api_key field)
ALTER TABLE google_sheets_connections 
ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT;

-- 5. Create secure configuration table for app settings
CREATE TABLE IF NOT EXISTS app_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    config_key TEXT NOT NULL,
    config_value TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, config_key)
);

-- Enable RLS on app_configurations
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_configurations
DROP POLICY IF EXISTS "Users can manage their own configurations" ON app_configurations;
CREATE POLICY "Users can manage their own configurations" ON app_configurations
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log (users can only see their own logs)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit logs" ON security_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON security_audit_log;

CREATE POLICY "Users can view their own audit logs" ON security_audit_log
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON security_audit_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 7. Create function to safely store encrypted API keys
CREATE OR REPLACE FUNCTION store_encrypted_api_key(
    p_user_id UUID,
    p_api_key TEXT,
    p_project_name TEXT DEFAULT 'Default Project'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    connection_id UUID;
BEGIN
    -- In production, this should use proper encryption
    -- For now, we'll use base64 encoding as a placeholder
    INSERT INTO google_sheets_connections (
        user_id,
        api_key,
        encrypted_api_key,
        project_name,
        status
    ) VALUES (
        p_user_id,
        '', -- Clear text API key will be empty
        encode(p_api_key::bytea, 'base64'), -- Placeholder encryption
        p_project_name,
        'active'
    )
    RETURNING id INTO connection_id;
    
    -- Log the action
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        success
    ) VALUES (
        p_user_id,
        'API_KEY_STORED',
        'google_sheets_connections',
        connection_id::text,
        true
    );
    
    RETURN connection_id;
END;
$$;

-- 8. Create function to safely retrieve decrypted API keys
CREATE OR REPLACE FUNCTION get_decrypted_api_key(
    p_connection_id UUID,
    p_user_id UUID
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    encrypted_key TEXT;
    decrypted_key TEXT;
BEGIN
    -- Verify user owns this connection
    SELECT encrypted_api_key INTO encrypted_key
    FROM google_sheets_connections
    WHERE id = p_connection_id AND user_id = p_user_id;
    
    IF encrypted_key IS NULL THEN
        RAISE EXCEPTION 'Connection not found or access denied';
    END IF;
    
    -- In production, this should use proper decryption
    -- For now, we'll use base64 decoding as a placeholder
    decrypted_key := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
    
    -- Log the access
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        success
    ) VALUES (
        p_user_id,
        'API_KEY_ACCESSED',
        'google_sheets_connections',
        p_connection_id::text,
        true
    );
    
    -- Update last_used_at
    UPDATE google_sheets_connections 
    SET last_used_at = NOW()
    WHERE id = p_connection_id;
    
    RETURN decrypted_key;
END;
$$;
