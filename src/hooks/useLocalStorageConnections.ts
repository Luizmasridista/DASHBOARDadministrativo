
import { GoogleSheetsConnection } from "@/types/googleSheetsConnection";

export const useLocalStorageConnections = () => {
  const saveConnectionsToCache = (connections: GoogleSheetsConnection[]) => {
    localStorage.setItem('google_sheets_connections', JSON.stringify(connections));
  };

  const loadConnectionsFromCache = (): GoogleSheetsConnection[] => {
    const fallbackConnections = localStorage.getItem('google_sheets_connections');
    if (fallbackConnections) {
      try {
        return JSON.parse(fallbackConnections);
      } catch (e) {
        console.error("Error parsing cached connections:", e);
        return [];
      }
    }
    return [];
  };

  return {
    saveConnectionsToCache,
    loadConnectionsFromCache
  };
};
