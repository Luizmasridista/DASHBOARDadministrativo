
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { GoogleSheetsConnection } from "@/types/googleSheetsConnection";
import { GoogleSheetsConnectionService } from "@/services/googleSheetsConnectionService";

export const useGoogleSheetsConnections = () => {
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch connections
  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedConnections = await GoogleSheetsConnectionService.fetchConnections();
      setConnections(fetchedConnections);
      
      // Save to local cache
      localStorage.setItem('google_sheets_connections', JSON.stringify(fetchedConnections));
      
    } catch (error) {
      console.error('Error fetching connections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      // Try to use local cache as fallback
      const fallbackConnections = localStorage.getItem('google_sheets_connections');
      if (fallbackConnections) {
        try {
          console.log("Using cached connections as fallback");
          const parsedConnections = JSON.parse(fallbackConnections);
          setConnections(parsedConnections);
          toast({
            title: "Using cached data",
            description: "Displaying locally stored connections",
            variant: "default"
          });
        } catch (e) {
          console.error("Error using fallback:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addConnection = async (apiKey: string, projectName: string, description?: string) => {
    try {
      setLoading(true);
      
      const newConnection = await GoogleSheetsConnectionService.addConnection(apiKey, projectName, description);
      setConnections(prev => [newConnection, ...prev]);
      
      toast({
        title: "Connection added",
        description: `API "${projectName}" was added successfully`,
      });

      return newConnection;
    } catch (error) {
      console.error('Error adding connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error adding connection",
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
      
      await GoogleSheetsConnectionService.removeConnection(connectionId);

      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      setConnections(updatedConnections);
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
      
      toast({
        title: "Connection removed",
        description: "The API connection was removed successfully",
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error removing connection",
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
      
      const { quota_used, last_used_at } = await GoogleSheetsConnectionService.updateLastUsed(
        connectionId, 
        connection.quota_used, 
        connection.quota_limit
      );
        
      const updatedConnections = connections.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            last_used_at,
            quota_used
          };
        }
        return conn;
      });
      
      setConnections(updatedConnections);
      localStorage.setItem('google_sheets_connections', JSON.stringify(updatedConnections));
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  };

  // Load connections when component mounts
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

export type { GoogleSheetsConnection };
