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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the request body
    const { email, password, full_name, teacher_id, roll_no, student_id } = await req.json();

    if (!email || !password || !full_name || !teacher_id) {
      throw new Error("Missing required fields");
    }

    // 1. Create the user using the admin API
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (userError) throw userError;

    // 2. Insert into profiles table with role 'student'
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([
        { id: userData.user.id, full_name, email, role: 'student' }
      ]);

    if (profileError) throw profileError;

    // 3. Insert or update students table
    if (student_id) {
      const { error: studentError } = await supabaseClient
        .from('students')
        .update({ 
          user_id: userData.user.id, 
          full_name, 
          roll_no: roll_no || undefined 
        })
        .eq('id', student_id);
      if (studentError) throw studentError;
    } else {
      const { error: studentError } = await supabaseClient
        .from('students')
        .insert([
          { 
            user_id: userData.user.id, 
            teacher_id, 
            full_name, 
            roll_no 
          }
        ]);
      if (studentError) throw studentError;
    }

    return new Response(
      JSON.stringify({ user: userData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const msg: string = error.message ?? '';
    const isDuplicate =
      msg.includes('already registered') ||
      msg.includes('23505') ||
      msg.toLowerCase().includes('unique') ||
      msg.toLowerCase().includes('duplicate');

    return new Response(
      JSON.stringify({
        error: isDuplicate
          ? 'That username is already taken. Please choose a different one.'
          : msg,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isDuplicate ? 409 : 400,
      }
    );
  }
});
