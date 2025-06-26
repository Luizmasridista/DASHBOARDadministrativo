
-- Primeiro, vamos garantir que removemos qualquer versão antiga da função
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Agora vamos recriar a função com a sintaxe correta e segura
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

-- Vamos também garantir que os triggers estão usando a função correta
DROP TRIGGER IF EXISTS update_google_sheets_connections_updated_at ON google_sheets_connections;

CREATE TRIGGER update_google_sheets_connections_updated_at
    BEFORE UPDATE ON google_sheets_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
