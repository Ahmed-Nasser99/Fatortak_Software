
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siqadxyjtkxeppwkkgls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcWFkeHlqdGt4ZXBwd2trZ2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDk3MjUsImV4cCI6MjA2NzEyNTcyNX0.4BRwWKq-trszpN3cpl7bkxKE1QmM1NYQ9mixI1tr4bc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
