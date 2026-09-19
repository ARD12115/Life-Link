import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Server-side client for server components
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Type-safe database types
export type Database = {
  public: {
    Tables: {
      blood_requests: {
        Row: {
          id: string;
          blood_group: string;
          component: string;
          created_at: string | null;
          delivery_point: string | null;
          hospital_id: string | null;
          notes: string | null;
          status: string;
          units_needed: number;
          updated_at: string | null;
          urgency: string;
        };
        Insert: {
          blood_group: string;
          component?: string;
          created_at?: string | null;
          delivery_point?: string | null;
          hospital_id?: string | null;
          notes?: string | null;
          status?: string;
          units_needed?: number;
          updated_at?: string | null;
          urgency?: string;
        };
        Update: {
          blood_group?: string;
          component?: string;
          created_at?: string | null;
          delivery_point?: string | null;
          hospital_id?: string | null;
          notes?: string | null;
          status?: string;
          units_needed?: number;
          updated_at?: string | null;
          urgency?: string;
        };
      };
      donor_responses: {
        Row: {
          created_at: string | null;
          donor_id: string | null;
          eta_minutes: number | null;
          id: string;
          request_id: string | null;
          responded_at: string | null;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          donor_id?: string | null;
          eta_minutes?: number | null;
          id?: string;
          request_id?: string | null;
          responded_at?: string | null;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          donor_id?: string | null;
          eta_minutes?: number | null;
          id?: string;
          request_id?: string | null;
          responded_at?: string | null;
          status?: string;
        };
      };
      donors: {
        Row: {
          available: boolean | null;
          blood_group: string;
          city: string;
          created_at: string | null;
          id: string;
          last_donated: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          phone: string | null;
          total_donations: number | null;
          user_id: string | null;
        };
        Insert: {
          available?: boolean | null;
          blood_group: string;
          city: string;
          created_at?: string | null;
          id?: string;
          last_donated?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          phone?: string | null;
          total_donations?: number | null;
          user_id?: string | null;
        };
        Update: {
          available?: boolean | null;
          blood_group?: string;
          city?: string;
          created_at?: string | null;
          id?: string;
          last_donated?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          phone?: string | null;
          total_donations?: number | null;
          user_id?: string | null;
        };
      };
      hospitals: {
        Row: {
          city: string;
          contact_person: string | null;
          created_at: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          name: string;
          phone: string | null;
          user_id: string | null;
        };
        Insert: {
          city: string;
          contact_person?: string | null;
          created_at?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          phone?: string | null;
          user_id?: string | null;
        };
        Update: {
          city?: string;
          contact_person?: string | null;
          created_at?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          phone?: string | null;
          user_id?: string | null;
        };
      };
    };
  };
}