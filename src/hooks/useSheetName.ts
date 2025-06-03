
import { useState, useEffect } from "react";
import { getSheetName } from "@/utils/sheetNameAPI";

export const useSheetName = () => {
  const [sheetName, setSheetName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchSheetName = async () => {
    const savedSheetId = localStorage.getItem('connectedSheetId');
    
    if (!savedSheetId) {
      setSheetName("");
      return;
    }

    setLoading(true);
    try {
      const name = await getSheetName(savedSheetId);
      setSheetName(name);
    } catch (error) {
      console.error("Error fetching sheet name:", error);
      setSheetName("Erro ao carregar nome");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetName();

    // Listen for sheet connection changes
    const handleConnectionUpdate = () => {
      fetchSheetName();
    };

    window.addEventListener('sheetConnected', handleConnectionUpdate);
    window.addEventListener('sheetDisconnected', handleConnectionUpdate);

    return () => {
      window.removeEventListener('sheetConnected', handleConnectionUpdate);
      window.removeEventListener('sheetDisconnected', handleConnectionUpdate);
    };
  }, []);

  return { sheetName, loading, refetch: fetchSheetName };
};
