
import { useState, useEffect } from "react";
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
}

export const useGoogleSheetsConnections = () => {
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('google_sheets_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "Erro ao carregar conexões",
        description: "Não foi possível carregar as conexões da API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addConnection = async (apiKey: string, projectName: string, description?: string) => {
    try {
      setLoading(true);
      
      // Validate API key by making a test request
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/test/values/A1:A1?key=${apiKey}`;
      const response = await fetch(testUrl);
      
      let status: 'active' | 'error' = 'active';
      if (!response.ok && response.status !== 404) {
        // 404 is expected for test sheet, other errors indicate invalid key
        if (response.status === 400 || response.status === 403) {
          status = 'error';
        }
      }

      const { data, error } = await supabase
        .from('google_sheets_connections')
        .insert({
          api_key: apiKey,
          project_name: projectName,
          description: description || null,
          status: status,
          quota_used: 0,
          quota_limit: 100000
        })
        .select()
        .single();

      if (error) throw error;

      setConnections(prev => [data, ...prev]);
      
      toast({
        title: "Conexão adicionada",
        description: `API "${projectName}" foi adicionada com sucesso`,
      });

      return data;
    } catch (error) {
      console.error('Error adding connection:', error);
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

      const { error } = await supabase
        .from('google_sheets_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      toast({
        title: "Conexão removida",
        description: "A conexão da API foi removida com sucesso",
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Erro ao remover conexão",
        description: "Não foi possível remover a conexão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLastUsed = async (connectionId: string) => {
    try {
      await supabase
        .from('google_sheets_connections')
        .update({ 
          last_used_at: new Date().toISOString(),
          quota_used: Math.floor(Math.random() * 1000) + 500 // Simulate quota usage
        })
        .eq('id', connectionId);
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

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
