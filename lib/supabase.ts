
import { createClient } from '@supabase/supabase-js';

// Vite 使用 import.meta.env 读取变量
// @ts-ignore
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
