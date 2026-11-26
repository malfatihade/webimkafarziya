import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200){
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function defaultKey(keysVariable: string, legacyVariable: string){
  const keysJson = Deno.env.get(keysVariable);
  if (keysJson) {
    try {
      const keys = JSON.parse(keysJson);
      return typeof keys.default === 'string' ? keys.default : '';
    } catch {
      console.error(`Invalid ${keysVariable} environment variable.`);
      return '';
    }
  }
  return Deno.env.get(legacyVariable) || '';
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = defaultKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
  const serviceRoleKey = defaultKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !anonKey || !serviceRoleKey) {
    console.error('Supabase function secrets are not configured.');
    return jsonResponse({ error: 'Layanan login belum dikonfigurasi.' }, 500);
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Permintaan tidak valid.' }, 400);
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-z0-9._-]{3,30}$/.test(username) || !password || password.length > 128) {
    return jsonResponse({ error: 'Username atau kata sandi tidak sesuai.' }, 401);
  }

  const adminClient = createClient(projectUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const authClient = createClient(projectUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('email')
    .eq('username', username)
    .maybeSingle();
  if (profileError) {
    console.error('Username lookup failed:', profileError.message);
    return jsonResponse({ error: 'Layanan login tidak tersedia.' }, 500);
  }
  if (!profile) {
    return jsonResponse({ error: 'Username atau kata sandi tidak sesuai.' }, 401);
  }

  const { data, error } = await authClient.auth.signInWithPassword({
    email: profile.email,
    password,
  });
  if (error || !data.session) {
    return jsonResponse({ error: 'Username atau kata sandi tidak sesuai.' }, 401);
  }

  return jsonResponse({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    user: data.user,
  });
});
