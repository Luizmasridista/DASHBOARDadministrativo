
export const getSheetName = async (sheetId: string): Promise<string> => {
  const API_KEY = "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg";
  
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${API_KEY}&fields=properties.title`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.properties?.title || 'Planilha sem nome';
    
  } catch (error) {
    console.error("Error fetching sheet name:", error);
    return 'Erro ao carregar nome';
  }
};
