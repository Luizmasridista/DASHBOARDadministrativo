
import { GoogleSheetsConnection, DEFAULT_QUOTA_USED, DEFAULT_QUOTA_LIMIT } from "@/types/googleSheetsConnection";

// Function to normalize status
export const normalizeStatus = (status: any): 'active' | 'inactive' | 'error' => {
  if (status === 'active') return 'active';
  if (status === 'error') return 'error';
  return 'inactive'; // Default for any other value
};

// Function to validate and normalize the connection data
export const validateAndNormalizeConnection = (connection: any): GoogleSheetsConnection => {
  console.log("Normalizing connection:", connection);
  
  return {
    id: connection.id || '',
    api_key: connection.api_key || `legacy_key_${connection.id}`,
    project_name: connection.project_name || 'API without name',
    description: connection.description || '',
    status: normalizeStatus(connection.status),
    last_used_at: connection.last_used_at,
    quota_used: Number(connection.quota_used) || DEFAULT_QUOTA_USED,
    quota_limit: Number(connection.quota_limit) || DEFAULT_QUOTA_LIMIT,
    created_at: connection.created_at || new Date().toISOString(),
    updated_at: connection.updated_at || new Date().toISOString(),
    user_id: connection.user_id
  };
};

// Function to validate API key
export const validateApiKey = async (apiKey: string): Promise<'active' | 'error'> => {
  const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/test/values/A1:A1?key=${apiKey}`;
  let status: 'active' | 'error' = 'active';
  
  try {
    const response = await fetch(testUrl);
    if (!response.ok && response.status !== 404) {
      if (response.status === 400 || response.status === 403) {
        status = 'error';
      }
    }
  } catch (e) {
    console.warn("Could not test API key, but continuing...");
  }
  
  return status;
};
