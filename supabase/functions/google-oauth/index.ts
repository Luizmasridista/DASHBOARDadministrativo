
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'auth-url':
        return await generateAuthUrl(req);
      
      case 'callback':
        return await handleCallback(req, user.id, supabase);
      
      case 'refresh':
        return await refreshToken(req, user.id, supabase);
      
      case 'revoke':
        return await revokeToken(req, user.id, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateAuthUrl(req: Request) {
  const { clientId, redirectUri, projectName } = await req.json();
  
  if (!clientId || !redirectUri) {
    throw new Error('Missing required parameters');
  }

  const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', JSON.stringify({ projectName }));

  return new Response(
    JSON.stringify({ authUrl: authUrl.toString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCallback(req: Request, userId: string, supabase: any) {
  const { code, clientId, clientSecret, redirectUri, state } = await req.json();
  
  if (!code || !clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing required parameters');
  }

  const stateData = state ? JSON.parse(state) : {};
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokens = await tokenResponse.json();
  
  // Get user info
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoResponse.ok) {
    throw new Error('Failed to get user info');
  }

  const userInfo = await userInfoResponse.json();
  
  // Calculate expiry time
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

  // Store connection in database
  const { data, error } = await supabase
    .from('google_sheets_connections')
    .upsert({
      user_id: userId,
      account_email: userInfo.email,
      account_name: userInfo.name,
      project_name: stateData.projectName || 'Default Project',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      status: 'active',
      last_used_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,account_email'
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to store connection');
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      connection: {
        id: data[0]?.id,
        accountEmail: userInfo.email,
        accountName: userInfo.name,
        projectName: stateData.projectName || 'Default Project'
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function refreshToken(req: Request, userId: string, supabase: any) {
  const { connectionId, clientId, clientSecret } = await req.json();
  
  if (!connectionId || !clientId || !clientSecret) {
    throw new Error('Missing required parameters');
  }

  // Get connection
  const { data: connection, error: fetchError } = await supabase
    .from('google_sheets_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !connection) {
    throw new Error('Connection not found');
  }

  if (!connection.refresh_token) {
    throw new Error('No refresh token available');
  }

  // Refresh the token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: connection.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    await supabase
      .from('google_sheets_connections')
      .update({ status: 'error' })
      .eq('id', connectionId);
    
    throw new Error(`Token refresh failed: ${error}`);
  }

  const tokens = await tokenResponse.json();
  
  // Calculate new expiry time
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

  // Update connection
  const { error: updateError } = await supabase
    .from('google_sheets_connections')
    .update({
      access_token: tokens.access_token,
      token_expires_at: expiresAt.toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId);

  if (updateError) {
    throw new Error('Failed to update connection');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function revokeToken(req: Request, userId: string, supabase: any) {
  const { connectionId } = await req.json();
  
  if (!connectionId) {
    throw new Error('Missing connection ID');
  }

  // Get connection
  const { data: connection, error: fetchError } = await supabase
    .from('google_sheets_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !connection) {
    throw new Error('Connection not found');
  }

  // Revoke token with Google
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error revoking token with Google:', error);
  }

  // Update connection status
  const { error: updateError } = await supabase
    .from('google_sheets_connections')
    .update({ status: 'revoked' })
    .eq('id', connectionId);

  if (updateError) {
    throw new Error('Failed to update connection status');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
