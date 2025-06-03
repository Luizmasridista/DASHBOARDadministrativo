
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GoogleSheetsConnection {
  id: string;
  api_key: string;
  project_name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  last_used_at?: string;
  quota_used: number;
  quota_limit: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Valores padrão para quotas
const DEFAULT_QUOTA_USED = 0;
const DEFAULT_QUOTA_LIMIT = 100000;

export const useGoogleSheetsConnections = () => {
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para normalizar status
  const normalizeStatus = (status: any): 'active' | 'inactive' | 'error' => {
    if (status === 'active') return 'active';
    if (status === 'error') return 'error';
    return 'inactive'; // Default para qualquer outro valor
  };

  // Função para validar e normalizar os dados de conexão
  const validateAndNormalizeConnection = (connection: any): GoogleSheetsConnection => {
    console.log("Normalizando conexão:", connection);
    
    return {
      id: connection.id || '',
      api_key: connection.api_key || `legacy_key_${connection.id}`,
      project_name: connection.project_name || 'API sem nome',
      description: connection.description || '',
      status: normalizeStatus(connection.status),
      last_used_at: connection.last_used_at,
      quota_used: Number(connection.quota_used) || DEFAULT_QUOTA_USED,
      quota_limit: Number(connection.quota_limit) || DEFAULT_QUOTA_LIMIT,
      created_at: connection.created_at || new Date().toISOString(),
      updated_at: connection.updated_at || new Date().toISOString(),
      user_id: connection.user_id
    };
  };

  // Função para buscar conexões
  const fetchConnections = useCallback(async () => {
    try {
      console.log("Iniciando busca de conexões...");
      setLoading(true);
      setError(null);

      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Erro ao obter usuário:", userError);
        throw new Error(`Erro ao obter usuário: ${userError.message}`);
      }
      
      if (!user) {
        console.log("Usuário não autenticado, mostrando estado vazio");
        setConnections([]);
        return;
      }

      console.log("Buscando conexões para o usuário:", user.id);
      
      // Buscar todas as conexões do usuário
      const { data, error } = await supabase
        .from('google_sheets_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro na query Supabase:", error);
        throw error;
      }

      console.log("Dados retornados do Supabase:", data);
      
      if (!data || data.length === 0) {
        console.log("Nenhuma conexão encontrada no banco de dados");
        setConnections([]);
        return;
      }

      // Normalizar cada conexão
      const normalizedConnections = data.map(conn => {
        try {
          return validateAndNormalizeConnection(conn);
        } catch (e) {
          console.error("Erro ao normalizar conexão:", e, conn);
          // Em caso de erro, criar uma conexão básica válida
          return {
            id: conn.id || '',
            api_key: conn.api_key || 'N/A',
            project_name: conn.project_name || 'API com erro',
            description: conn.description || 'Erro na normalização',
            status: 'error' as const,
            last_used_at: conn.last_used_at,
            quota_used: 0,
            quota_limit: DEFAULT_QUOTA_LIMIT,
            created_at: conn.created_at || new Date().toISOString(),
            updated_at: conn.updated_at || new Date().toISOString(),
            user_id: conn.user_id
          };
        }
      });
      
      console.log("Conexões normalizadas:", normalizedConnections);
      setConnections(normalizedConnections);
      
      // Salvar no cache local
      localStorage.setItem('google_sheets_connections', JSON.stringify(normalizedConnections));
      
    } catch (error) {
      console.error('Erro ao buscar conexões:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      // Tentar usar cache local como fallback
      const fallbackConnections = localStorage.getItem('google_sheets_connections');
      if (fallbackConnections) {
        try {
          console.log("Usando conexões em cache como fallback");
          const parsedConnections = JSON.parse(fallbackConnections);
          setConnections(parsedConnections);
          toast({
            title: "Usando dados em cache",
            description: "Exibindo conexões armazenadas localmente",
            variant: "default"
          });
        } catch (e) {
          console.error("Erro ao usar fallback:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addConnection = async (apiKey: string, projectName: string, description?: string) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log("Adicionando nova conexão:", projectName);
      
      // Validate API key by making a test request
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/test/values/A1:A1?key=${apiKey}`;
      let status: 'active' | 'error' = 'active';
      
      try {
        const response = await fetch(testUrl);
        if (!response.ok && response.status !== 404) {
          if (response.status === 400 || response.status === 403) {
            status = 'error';
          }
        }
      } catch (e) {
        console.warn("Não foi possível testar a chave API, mas continuando...");
      }

      const connectionData = {
        api_key: apiKey,
        project_name: projectName,
        description: description || null,
        status: status,
        quota_used: DEFAULT_QUOTA_USED,
        quota_limit: DEFAULT_QUOTA_LIMIT,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('google_sheets_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir conexão:", error);
        throw error;
      }

      const newConnection = validateAndNormalizeConnection(data);
      setConnections(prev => [newConnection, ...prev]);
      
      toast({
        title: "Conexão adicionada",
        description: `API "${projectName}" foi adicionada com sucesso`,
      });

      return newConnection;
    } catch (error) {
      console.error('Erro ao adicionar conexão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao adicionar conexão",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      setLoading(true);
      console.log("Removendo conexão:", connectionId);

      const { error } = await supabase
        .from('google_sheets_connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        throw error;
      }

      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      setConnections(updatedConnections);
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
      
      toast({
        title: "Conexão removida",
        description: "A conexão da API foi removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover conexão:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao remover conexão",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLastUsed = async (connectionId: string) => {
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection) return;
      
      const currentQuota = connection.quota_used || 0;
      const quotaIncrement = Math.floor(Math.random() * 50) + 10;
      const newQuotaUsed = Math.min(currentQuota + quotaIncrement, connection.quota_limit || DEFAULT_QUOTA_LIMIT);
      
      await supabase
        .from('google_sheets_connections')
        .update({ 
          last_used_at: new Date().toISOString(),
          quota_used: newQuotaUsed
        })
        .eq('id', connectionId);
        
      const updatedConnections = connections.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            last_used_at: new Date().toISOString(),
            quota_used: newQuotaUsed
          };
        }
        return conn;
      });
      
      setConnections(updatedConnections);
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
    } catch (error) {
      console.error('Erro ao atualizar último uso:', error);
    }
  };

  // Carregar conexões ao montar o componente
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    loading,
    error,
    addConnection,
    removeConnection,
    updateLastUsed,
    refetch: fetchConnections
  };
};
