
import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // OAuth functionality has been removed - return empty array
      console.log('OAuth functionality has been removed');
      setConnections([]);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "OAuth removido",
        description: "A funcionalidade OAuth foi removida. Use o método de API key.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAuthUrl = async (clientId: string, redirectUri: string, projectName: string) => {
    toast({
      title: "Funcionalidade removida",
      description: "A autenticação OAuth foi removida. Use o método de API key diretamente.",
    });
    return '';
  };

  const handleOAuthCallback = async (
    code: string, 
    clientId: string, 
    clientSecret: string, 
    redirectUri: string, 
    state?: string
  ) => {
    toast({
      title: "Funcionalidade removida",
      description: "O callback OAuth foi removido. Use o método de API key.",
    });
    return null;
  };

  const refreshConnection = async (connectionId: string, clientId: string, clientSecret: string) => {
    toast({
      title: "Funcionalidade removida",
      description: "A renovação de tokens foi removida.",
    });
  };

  const revokeConnection = async (connectionId: string) => {
    toast({
      title: "Funcionalidade removida",
      description: "A revogação de conexões foi removida.",
    });
  };

  const deleteConnection = async (connectionId: string) => {
    toast({
      title: "Funcionalidade removida",
      description: "A exclusão de conexões foi removida.",
    });
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
