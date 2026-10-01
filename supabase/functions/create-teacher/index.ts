import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // IMPORTANT: Use Service Role Key here
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the request body
    const { email, password, full_name } = await req.json();

    if (!email || !password || !full_name) {
      throw new Error("Missing required fields");
    }

    // 1. Create the user using the admin API
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for teachers created by admin
      user_metadata: { full_name }
    });

    if (userError) throw userError;

    // 2. Insert into profiles table with role 'teacher'
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([
        { id: userData.user.id, full_name, email, role: 'teacher' }
      ]);

    if (profileError) {
      throw profileError;
    }

    return new Response(
      JSON.stringify({ user: userData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
