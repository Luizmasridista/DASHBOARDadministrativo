import { SheetData, SheetAPIResponse } from "@/types/sheetData";
import { processSheetData } from "./sheetDataProcessor";

export const fetchSheetDataWithAPI = async (apiKey: string, connectionId: string): Promise<SheetData[]> => {
  try {
    // Get sheet configuration from localStorage
    const savedSheetId = localStorage.getItem('connectedSheetId');
    const savedRange = localStorage.getItem('connectedSheetRange');
    
    if (!savedSheetId) {
      console.log("No sheet ID configured");
      return [];
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${savedSheetId}/values/${savedRange || 'A1:D100'}?key=${apiKey}`;
    
    console.log("Making API request with connected API key:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    const sheetData: SheetAPIResponse = await response.json();
    console.log("Data received from sheet:", sheetData);
    
    if (sheetData.values && sheetData.values.length > 1) {
      return processSheetData(sheetData.values);
    } else {
      throw new Error("Nenhum dado encontrado na planilha ou formato incorreto");
    }
    
  } catch (error) {
    console.error("Error fetching data with API key:", error);
    throw error;
  }
};

export const fetchSheetDataWithDefaultAPI = async (sheetId: string): Promise<SheetData[]> => {
  const API_KEY = "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:D100?key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  const sheetData: SheetAPIResponse = await response.json();
  if (sheetData.values && sheetData.values.length > 1) {
    // Tag each item with the source sheet id
    return processSheetData(sheetData.values).map(item => ({ ...item, _sourceSheetId: sheetId }));
  }
  
  return [];
};
