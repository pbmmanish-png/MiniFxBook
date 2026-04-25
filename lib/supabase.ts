import { createClient } from '@supabase/supabase-js';

// Ye URLs aapko Supabase dashboard (Project Settings -> API) se milenge
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);