
import { useState } from "react";
import { GoogleSheetsConnection } from "@/types/googleSheetsConnection";

export const useConnectionsState = () => {
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConnection = (connectionId: string, updates: Partial<GoogleSheetsConnection>) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, ...updates }
          : conn
      )
    );
  };

  const removeConnectionFromState = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const addConnectionToState = (newConnection: GoogleSheetsConnection) => {
    setConnections(prev => [newConnection, ...prev]);
  };

  return {
    connections,
    setConnections,
    loading,
    setLoading,
    error,
    setError,
    updateConnection,
    removeConnectionFromState,
    addConnectionToState
  };
};
