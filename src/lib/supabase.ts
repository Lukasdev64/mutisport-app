import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase credentials not found - using localStorage fallback');
}

// Only create the client if credentials exist to avoid runtime error
export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : ({
      functions: {
        invoke: async () => ({ 
          data: null, 
          error: new Error('Supabase not configured. Please check your environment variables.') 
        })
      },
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
            maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createClient<Database>>);

// Helper for anonymous tournament creation with edit tokens
export const generateEditToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Helper for unique URL codes
export const generateUrlCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
