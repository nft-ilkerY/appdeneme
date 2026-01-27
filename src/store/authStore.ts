import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user });

        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({ profile });

          // Update last login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id);
        }
      }

      set({ initialized: true, loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ user: session?.user ?? null });

        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ profile: profile ?? null });
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        set({ user: data.user });

        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          set({ profile });

          // Update last login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        }
      }

      set({ loading: false });
      return { error: null };
    } catch (error) {
      set({ loading: false });
      return { error: error as Error };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
}));
