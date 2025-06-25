import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSheetConnection {
  id: string;
  project_name: string;
  description: string | null;
  api_key: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: string;
  quota_limit: number | null;
  quota_used: number | null;
  last_used_at: string | null;
  sheetTitle?: string;
}

async function fetchSheetTitle(sheetId: string): Promise<string | undefined> {
  try {
    const API_KEY = "AIzaSyBVFJQDkbI2MAgkS8OPYPGGz3IETLs0GQg";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title&key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const json = await response.json();
    return json.properties?.title;
  } catch {
    return undefined;
  }
}

export function useUserSheets() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<UserSheetConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSheets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('google_sheets_connections')
      .select('*')
      .eq('user_id', user.id)
      .then(async ({ data, error }) => {
        if (error) {
          setError(error.message);
          setSheets([]);
          setLoading(false);
        } else {
          // Fetch sheet titles in parallel
          const withTitles = await Promise.all(
            (data || []).map(async (sheet) => {
              const sheetTitle = await fetchSheetTitle(sheet.project_name);
              return { ...sheet, sheetTitle };
            })
          );
          setSheets(withTitles);
          setError(null);
          setLoading(false);
        }
      });
  }, [user]);

  return { sheets, loading, error };
} 