
export interface GoogleSheetsConnection {
  id: string;
  api_key: string;
  project_name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  last_used_at?: string;
  quota_used: number;
  quota_limit: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Default values for quotas
export const DEFAULT_QUOTA_USED = 0;
export const DEFAULT_QUOTA_LIMIT = 100000;
