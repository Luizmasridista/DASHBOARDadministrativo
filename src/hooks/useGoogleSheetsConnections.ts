
import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { GoogleSheetsConnection } from "@/types/googleSheetsConnection";
import { GoogleSheetsConnectionService } from "@/services/googleSheetsConnectionService";
import { useConnectionsState } from "./useConnectionsState";
import { useLocalStorageConnections } from "./useLocalStorageConnections";
import { useConnectionOperations } from "./useConnectionOperations";

export const useGoogleSheetsConnections = () => {
  const {
    connections,
    setConnections,
    loading,
    setLoading,
    error,
    setError,
    updateConnection,
    removeConnectionFromState,
    addConnectionToState
  } = useConnectionsState();

  const { saveConnectionsToCache, loadConnectionsFromCache } = useLocalStorageConnections();

  const {
    addConnection,
    removeConnection,
    updateLastUsed
  } = useConnectionOperations({
    connections,
    setLoading,
    addConnectionToState,
    removeConnectionFromState,
    updateConnection,
    saveConnectionsToCache
  });

  // Function to fetch connections
  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedConnections = await GoogleSheetsConnectionService.fetchConnections();
      setConnections(fetchedConnections);
      
      // Save to local cache
      saveConnectionsToCache(fetchedConnections);
      
    } catch (error) {
      console.error('Error fetching connections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      // Try to use local cache as fallback
      const cachedConnections = loadConnectionsFromCache();
      if (cachedConnections.length > 0) {
        console.log("Using cached connections as fallback");
        setConnections(cachedConnections);
        toast({
          title: "Using cached data",
          description: "Displaying locally stored connections",
          variant: "default"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setConnections, saveConnectionsToCache, loadConnectionsFromCache]);

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
