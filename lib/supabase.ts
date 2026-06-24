import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'admin' | 'user';
          created_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          author_id: string;
          content: string;
          media_type: 'text' | 'video' | 'audio' | 'image' | 'mixed';
          media_urls: string[];
          description: string;
          published_at: string;
          scheduled_for: string | null;
          created_at: string;
          updated_at: string;
          views: number;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          post_id: string;
          action: string;
          timestamp: string;
        };
      };
    };
  };
};
