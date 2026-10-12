import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getFunctionErrorMessage(error, data) {
  if (data?.error) return data.error;
  if (error) {
    if (error.context && typeof error.context.json === 'function') {
      try {
        const body = await error.context.json();
        if (body?.error) return body.error;
        if (body?.message) return body.message;
      } catch (_) {}
    }
    return error.message || 'An error occurred';
  }
  return 'An unexpected error occurred.';
}
