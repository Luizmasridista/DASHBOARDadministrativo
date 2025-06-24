
-- Criar função no schema public para verificar se a senha está definida para um usuário
CREATE OR REPLACE FUNCTION public.check_user_has_password(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se existe uma senha definida para o usuário
    -- Usamos uma consulta que verifica se o usuário foi criado com senha
    -- (usuários do Google OAuth não têm senha inicial)
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = COALESCE(user_id, auth.uid())
        AND encrypted_password IS NOT NULL 
        AND encrypted_password != ''
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro (ex: usuário não encontrado), retorna false
        RETURN false;
END;
$$;

-- Conceder permissões para que a função possa ser executada
GRANT EXECUTE ON FUNCTION public.check_user_has_password(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_has_password(UUID) TO anon;

-- Comentário explicativo da função
COMMENT ON FUNCTION public.check_user_has_password(UUID) IS 'Verifica se um usuário tem uma senha definida no sistema de autenticação. Retorna true se a senha existe, false caso contrário.';
