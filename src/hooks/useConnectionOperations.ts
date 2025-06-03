
import { toast } from "@/hooks/use-toast";
import { GoogleSheetsConnection } from "@/types/googleSheetsConnection";
import { GoogleSheetsConnectionService } from "@/services/googleSheetsConnectionService";

interface UseConnectionOperationsProps {
  connections: GoogleSheetsConnection[];
  setLoading: (loading: boolean) => void;
  addConnectionToState: (connection: GoogleSheetsConnection) => void;
  removeConnectionFromState: (connectionId: string) => void;
  updateConnection: (connectionId: string, updates: Partial<GoogleSheetsConnection>) => void;
  saveConnectionsToCache: (connections: GoogleSheetsConnection[]) => void;
}

export const useConnectionOperations = ({
  connections,
  setLoading,
  addConnectionToState,
  removeConnectionFromState,
  updateConnection,
  saveConnectionsToCache
}: UseConnectionOperationsProps) => {

  const addConnection = async (apiKey: string, projectName: string, description?: string) => {
    try {
      setLoading(true);
      
      const newConnection = await GoogleSheetsConnectionService.addConnection(apiKey, projectName, description);
      addConnectionToState(newConnection);
      
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

      removeConnectionFromState(connectionId);
      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      saveConnectionsToCache(updatedConnections);
      
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
        
      updateConnection(connectionId, {
        last_used_at,
        quota_used
      });
      
      saveConnectionsToCache(connections.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            last_used_at,
            quota_used
          };
        }
        return conn;
      }));
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  };

  return {
    addConnection,
    removeConnection,
    updateLastUsed
  };
};
