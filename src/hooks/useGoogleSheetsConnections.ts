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

// Número máximo de tentativas de retry
const MAX_RETRY_ATTEMPTS = 3;
// Delay entre tentativas (em ms)
const RETRY_DELAY = 1000;
// Valores padrão para quotas
const DEFAULT_QUOTA_USED = 0;
const DEFAULT_QUOTA_LIMIT = 100000;

export const useGoogleSheetsConnections = () => {
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Função para validar e normalizar os dados de conexão
  const validateAndNormalizeConnection = (connection: any): GoogleSheetsConnection => {
    console.log("Validando conexão:", connection);
    
    // Garantir que todos os campos obrigatórios existam
    if (!connection.id || !connection.project_name) {
      console.warn("Conexão com dados incompletos:", connection);
    }
    
    // Normalizar status para um dos valores aceitos
    let normalizedStatus: 'active' | 'inactive' | 'error';
    switch (connection.status) {
      case 'active':
        normalizedStatus = 'active';
        break;
      case 'expired':
      case 'revoked':
      case 'inactive':
        normalizedStatus = 'inactive';
        break;
      case 'error':
        normalizedStatus = 'error';
        break;
      default:
        console.warn(`Status desconhecido '${connection.status}' para conexão ${connection.id}, definindo como 'inactive'`);
        normalizedStatus = 'inactive';
    }
    
    // Garantir valores padrão para quotas
    const quota_used = connection.quota_used !== null && connection.quota_used !== undefined 
      ? Number(connection.quota_used) 
      : DEFAULT_QUOTA_USED;
      
    const quota_limit = connection.quota_limit !== null && connection.quota_limit !== undefined 
      ? Number(connection.quota_limit) 
      : DEFAULT_QUOTA_LIMIT;
    
    // Garantir que api_key existe (mesmo que seja uma chave legada)
    const api_key = connection.api_key || `legacy_key_${connection.id}`;
    
    // Retornar objeto normalizado
    return {
      id: connection.id,
      api_key,
      project_name: connection.project_name,
      description: connection.description || "",
      status: normalizedStatus,
      last_used_at: connection.last_used_at || null,
      quota_used,
      quota_limit,
      created_at: connection.created_at || new Date().toISOString(),
      updated_at: connection.updated_at || new Date().toISOString(),
      user_id: connection.user_id
    };
  };

  // Função para buscar conexões com retry automático
  const fetchConnections = useCallback(async (attempt = 0) => {
    try {
      console.log(`Tentativa ${attempt + 1} de ${MAX_RETRY_ATTEMPTS} para buscar conexões`);
      setLoading(true);
      setError(null);

      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Erro ao obter usuário:", userError);
        throw new Error(`Erro ao obter usuário: ${userError.message}`);
      }
      
      if (!user) {
        console.warn("Usuário não autenticado");
        setConnections([]);
        setError("Usuário não autenticado");
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
        console.error("Erro ao buscar conexões:", error);
        throw error;
      }

      console.log(`Encontradas ${data?.length || 0} conexões`);
      
      // Validar e normalizar cada conexão
      const validConnections = (data || []).map(conn => {
        try {
          return validateAndNormalizeConnection(conn);
        } catch (e) {
          console.error("Erro ao validar conexão:", e, conn);
          return null;
        }
      }).filter(Boolean) as GoogleSheetsConnection[];
      
      // Verificar se temos conexões válidas
      if (validConnections.length === 0 && data && data.length > 0) {
        console.warn("Nenhuma conexão válida encontrada após normalização");
      }

      setConnections(validConnections);
      setRetryCount(0); // Resetar contador de tentativas após sucesso
    } catch (error) {
      console.error('Erro ao buscar conexões:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      // Implementar retry automático
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        console.log(`Tentando novamente em ${RETRY_DELAY}ms...`);
        setRetryCount(attempt + 1);
        setTimeout(() => fetchConnections(attempt + 1), RETRY_DELAY);
      } else {
        console.error("Número máximo de tentativas excedido");
        toast({
          title: "Erro ao carregar conexões",
          description: "Não foi possível carregar as conexões da API após várias tentativas",
          variant: "destructive"
        });
        
        // Implementar fallback - tentar buscar localmente se disponível
        const fallbackConnections = localStorage.getItem('google_sheets_connections');
        if (fallbackConnections) {
          try {
            console.log("Usando conexões em cache como fallback");
            const parsedConnections = JSON.parse(fallbackConnections);
            setConnections(parsedConnections.map(validateAndNormalizeConnection));
            toast({
              title: "Usando dados em cache",
              description: "Exibindo conexões armazenadas localmente",
              variant: "default"
            });
          } catch (e) {
            console.error("Erro ao usar fallback:", e);
          }
        }
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  }, [retryCount]);

  const addConnection = async (apiKey: string, projectName: string, description?: string) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Erro ao obter usuário: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log("Adicionando nova conexão:", projectName);
      
      // Validate API key by making a test request
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/test/values/A1:A1?key=${apiKey}`;
      let response;
      try {
        response = await fetch(testUrl);
        console.log("Resposta do teste de API:", response.status);
      } catch (e) {
        console.error("Erro ao testar chave API:", e);
        throw new Error("Não foi possível validar a chave API. Verifique sua conexão com a internet.");
      }
      
      let status: 'active' | 'error' = 'active';
      if (!response.ok && response.status !== 404) {
        // 404 is expected for test sheet, other errors indicate invalid key
        if (response.status === 400 || response.status === 403) {
          console.warn("Chave API inválida ou sem permissões adequadas");
          status = 'error';
        }
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
      
      console.log("Inserindo conexão no banco de dados:", connectionData);

      const { data, error } = await supabase
        .from('google_sheets_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir conexão:", error);
        throw error;
      }

      // Type the returned data properly
      const typedConnection = validateAndNormalizeConnection(data);

      // Atualizar a lista de conexões
      setConnections(prev => [typedConnection, ...prev]);
      
      // Atualizar cache local
      const updatedConnections = [typedConnection, ...connections];
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
      
      toast({
        title: "Conexão adicionada",
        description: `API "${projectName}" foi adicionada com sucesso`,
      });

      return typedConnection;
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
        console.error("Erro ao remover conexão:", error);
        throw error;
      }

      // Atualizar a lista de conexões
      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      setConnections(updatedConnections);
      
      // Atualizar cache local
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
      console.log("Atualizando último uso da conexão:", connectionId);
      
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection) {
        console.warn("Tentativa de atualizar conexão inexistente:", connectionId);
        return;
      }
      
      // Calcular novo uso de quota (simulação mais realista)
      const currentQuota = connection.quota_used || 0;
      const quotaIncrement = Math.floor(Math.random() * 50) + 10; // Entre 10 e 60 unidades
      const newQuotaUsed = Math.min(currentQuota + quotaIncrement, connection.quota_limit || DEFAULT_QUOTA_LIMIT);
      
      await supabase
        .from('google_sheets_connections')
        .update({ 
          last_used_at: new Date().toISOString(),
          quota_used: newQuotaUsed
        })
        .eq('id', connectionId);
        
      // Atualizar a conexão localmente
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
      
      // Atualizar cache local
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
    } catch (error) {
      console.error('Erro ao atualizar último uso:', error);
    }
  };

  // Carregar conexões ao montar o componente
  useEffect(() => {
    fetchConnections();
    
    // Tentar carregar do cache local enquanto aguarda resposta do servidor
    const cachedConnections = localStorage.getItem('google_sheets_connections');
    if (cachedConnections) {
      try {
        console.log("Carregando conexões do cache local");
        const parsedConnections = JSON.parse(cachedConnections);
        setConnections(parsedConnections.map(validateAndNormalizeConnection));
      } catch (e) {
        console.error("Erro ao carregar conexões do cache:", e);
      }
    }
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
