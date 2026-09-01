import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type GenerationType = 'text' | 'image' | 'code';

export interface Generation {
  id: string;
  user_id: string;
  type: GenerationType;
  title: string;
  input: Record<string, unknown>;
  output: string;
  image_urls: string[];
  language?: string;
  framework?: string;
  created_at: string;
}

export interface SavedContent {
  id: string;
  user_id: string;
  type: 'text' | 'image' | 'code' | 'prompt';
  title: string;
  content: string;
  image_urls: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  name: string;
  category: string;
  type: 'text' | 'image' | 'code';
  description: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}
