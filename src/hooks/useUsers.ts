import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data as User[];
    },
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      full_name: string;
      role: 'admin' | 'operator' | 'worker' | 'viewer';
      phone?: string;
    }) => {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      // Then update the user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        full_name?: string;
        role?: 'admin' | 'operator' | 'worker' | 'viewer';
        phone?: string;
        is_active?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - just deactivate the user
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return true;
    },
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user_stats'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select('role, is_active');

      if (error) throw error;

      const stats = {
        total: users.length,
        active: users.filter((u) => u.is_active).length,
        inactive: users.filter((u) => !u.is_active).length,
        byRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    },
  });
}
