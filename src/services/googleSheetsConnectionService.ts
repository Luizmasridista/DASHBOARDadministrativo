
import { supabase } from "@/integrations/supabase/client";
import { GoogleSheetsConnection, DEFAULT_QUOTA_USED, DEFAULT_QUOTA_LIMIT } from "@/types/googleSheetsConnection";
import { validateAndNormalizeConnection, validateApiKey } from "@/utils/googleSheetsConnectionUtils";

export class GoogleSheetsConnectionService {
  
  static async fetchConnections(): Promise<GoogleSheetsConnection[]> {
    console.log("Starting connection search...");

    // Get current user first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Error getting user: ${userError.message}`);
    }
    
    if (!user) {
      console.log("User not authenticated, showing empty state");
      return [];
    }

    console.log("Searching connections for user:", user.id);
    
    // Fetch all user connections
    const { data, error } = await supabase
      .from('google_sheets_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error in Supabase query:", error);
      throw error;
    }

    console.log("Data returned from Supabase:", data);
    
    if (!data || data.length === 0) {
      console.log("No connections found in database");
      return [];
    }

    // Normalize each connection
    const normalizedConnections = data.map(conn => {
      try {
        return validateAndNormalizeConnection(conn);
      } catch (e) {
        console.error("Error normalizing connection:", e, conn);
        // In case of error, create a basic valid connection
        return {
          id: conn.id || '',
          api_key: conn.api_key || 'N/A',
          project_name: conn.project_name || 'API with error',
          description: conn.description || 'Normalization error',
          status: 'error' as const,
          last_used_at: conn.last_used_at,
          quota_used: 0,
          quota_limit: DEFAULT_QUOTA_LIMIT,
          created_at: conn.created_at || new Date().toISOString(),
          updated_at: conn.updated_at || new Date().toISOString(),
          user_id: conn.user_id
        };
      }
    });
    
    console.log("Normalized connections:", normalizedConnections);
    return normalizedConnections;
  }

  static async addConnection(apiKey: string, projectName: string, description?: string): Promise<GoogleSheetsConnection> {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    console.log("Adding new connection:", projectName);
    
    // Validate API key
    const status = await validateApiKey(apiKey);

    const connectionData = {
      api_key: apiKey,
      project_name: projectName,
      description: description || null,
      status: status,
      quota_used: DEFAULT_QUOTA_USED,
      quota_limit: DEFAULT_QUOTA_LIMIT,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('google_sheets_connections')
      .insert(connectionData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting connection:", error);
      throw error;
    }

    return validateAndNormalizeConnection(data);
  }

  static async removeConnection(connectionId: string): Promise<void> {
    console.log("Removing connection:", connectionId);

    const { error } = await supabase
      .from('google_sheets_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      throw error;
    }
  }

  static async updateLastUsed(connectionId: string, currentQuotaUsed: number, quotaLimit: number): Promise<{ quota_used: number; last_used_at: string }> {
    const quotaIncrement = Math.floor(Math.random() * 50) + 10;
    const newQuotaUsed = Math.min(currentQuotaUsed + quotaIncrement, quotaLimit);
    const lastUsedAt = new Date().toISOString();
    
    await supabase
      .from('google_sheets_connections')
      .update({ 
        last_used_at: lastUsedAt,
        quota_used: newQuotaUsed
      })
      .eq('id', connectionId);
      
    return {
      quota_used: newQuotaUsed,
      last_used_at: lastUsedAt
    };
  }
}
