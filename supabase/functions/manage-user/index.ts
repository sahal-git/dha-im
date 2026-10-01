import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    const { action, userId, email, password, full_name, role } = await req.json();

    if (!userId || !action) {
      throw new Error("Missing userId or action");
    }

    if (action === 'delete') {
      // 1. Delete user from auth (cascades or we can safely assume it will be cleaned up)
      // Actually, standard practice: deleting from auth.users cascades to public.profiles 
      // if ON DELETE CASCADE is set. If not, delete child records first.
      
      // Let's explicitly delete child records first just in case
      if (role === 'student') {
        await supabaseClient.from('students').delete().eq('user_id', userId);
      }
      await supabaseClient.from('profiles').delete().eq('id', userId);

      // Delete the Auth user
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
      });
    }

    if (action === 'update') {
      // 1. Update Auth user (email/password)
      const updatePayload: any = {};
      if (email) {
        updatePayload.email = email;
        updatePayload.email_confirm = true;
      }
      if (password) {
        updatePayload.password = password;
      }
      if (full_name) {
        updatePayload.user_metadata = { full_name };
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error: authUpdateError } = await supabaseClient.auth.admin.updateUserById(userId, updatePayload);
        if (authUpdateError) throw authUpdateError;
      }

      // 2. Update Profiles table
      if (full_name || email) {
        const profilePayload: any = {};
        if (full_name) profilePayload.full_name = full_name;
        if (email) profilePayload.email = email;

        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update(profilePayload)
          .eq('id', userId);
        if (profileError) throw profileError;
      }

      // 3. Update Students table if applicable
      if (role === 'student' && full_name) {
        const { error: studentError } = await supabaseClient
          .from('students')
          .update({ full_name })
          .eq('user_id', userId);
        if (studentError) throw studentError;
      }

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    // Surface a friendly message for duplicate username/email conflicts
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
