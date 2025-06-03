
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GoogleConnection {
  id: string;
  account_email: string;
  account_name: string;
  project_name: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  created_at: string;
  last_used_at: string;
  token_expires_at: string;
}

export const useGoogleConnections = () => {
  const [connections, setConnections] = useState<GoogleConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('google_sheets_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "Erro ao carregar conexões",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAuthUrl = async (clientId: string, redirectUri: string, projectName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth/auth-url', {
        body: { clientId, redirectUri, projectName }
      });

      if (error) throw error;
      return data.authUrl;
    } catch (error) {
      console.error('Error generating auth URL:', error);
      toast({
        title: "Erro ao gerar URL de autorização",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleOAuthCallback = async (
    code: string, 
    clientId: string, 
    clientSecret: string, 
    redirectUri: string, 
    state?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth/callback', {
        body: { code, clientId, clientSecret, redirectUri, state }
      });

      if (error) throw error;

      toast({
        title: "Conexão realizada com sucesso!",
        description: `Conta ${data.connection.accountEmail} conectada.`,
      });

      await fetchConnections();
      return data.connection;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      toast({
        title: "Erro ao processar autorização",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshConnection = async (connectionId: string, clientId: string, clientSecret: string) => {
    try {
      const { error } = await supabase.functions.invoke('google-oauth/refresh', {
        body: { connectionId, clientId, clientSecret }
      });

      if (error) throw error;

      toast({
        title: "Token atualizado",
        description: "Token de acesso renovado com sucesso.",
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast({
        title: "Erro ao renovar token",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  };

  const revokeConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('google-oauth/revoke', {
        body: { connectionId }
      });

      if (error) throw error;

      toast({
        title: "Conexão revogada",
        description: "Acesso removido com sucesso.",
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error revoking connection:', error);
      toast({
        title: "Erro ao revogar conexão",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('google_sheets_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Conexão removida",
        description: "Conexão deletada com sucesso.",
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Erro ao deletar conexão",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    loading,
    error,
    refetch: fetchConnections,
    generateAuthUrl,
    handleOAuthCallback,
    refreshConnection,
    revokeConnection,
    deleteConnection
  };
};
