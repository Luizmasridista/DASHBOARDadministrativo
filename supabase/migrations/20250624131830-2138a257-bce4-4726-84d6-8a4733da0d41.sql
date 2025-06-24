
-- Excluir usuários que não possuem senha definida
-- ATENÇÃO: Esta operação é IRREVERSÍVEL e excluirá permanentemente as contas
DELETE FROM auth.users 
WHERE encrypted_password IS NULL 
   OR encrypted_password = '';

-- Opcional: Limpar dados relacionados na tabela de profiles (se existir)
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Opcional: Limpar logs de auditoria de usuários excluídos
DELETE FROM public.security_audit_log 
WHERE user_id NOT IN (SELECT id FROM auth.users);
