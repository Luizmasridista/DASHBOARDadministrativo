
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ApiConnection {
  id: string;
  project_name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'error';
  quota_used: number | null;
  quota_limit: number | null;
  created_at: string;
  last_used_at: string | null;
}

export const useSecureApiConnections = () => {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('google_sheets_connections')
        .select('id, project_name, description, status, quota_used, quota_limit, created_at, last_used_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching API connections:', error);
      toast({
        title: 'Erro ao carregar conexões',
        description: 'Não foi possível carregar as conexões da API.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const storeApiKey = async (apiKey: string, projectName: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Call the secure function to store encrypted API key
      const { data, error } = await supabase.rpc('store_encrypted_api_key', {
        p_user_id: user.id,
        p_api_key: apiKey,
        p_project_name: projectName
      });

      if (error) throw error;

      // Update the connection with description if provided
      if (description) {
        await supabase
          .from('google_sheets_connections')
          .update({ description })
          .eq('id', data);
      }

      toast({
        title: 'Chave API armazenada com segurança',
        description: 'A chave API foi criptografada e armazenada com segurança.',
      });

      // Refresh connections list
      await fetchConnections();
      return data;
    } catch (error) {
      console.error('Error storing API key:', error);
      toast({
        title: 'Erro ao armazenar chave API',
        description: 'Não foi possível armazenar a chave API com segurança.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const getDecryptedApiKey = async (connectionId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('get_decrypted_api_key', {
        p_connection_id: connectionId,
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      throw error;
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('google_sheets_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Conexão removida',
        description: 'A conexão da API foi removida com segurança.',
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: 'Erro ao remover conexão',
        description: 'Não foi possível remover a conexão.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  return {
    connections,
    loading,
    storeApiKey,
    getDecryptedApiKey,
    deleteConnection,
    refetch: fetchConnections
  };
};
