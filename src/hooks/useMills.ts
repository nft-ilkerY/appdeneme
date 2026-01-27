import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Mill, MillWithRelations } from '@/types';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useMills() {
  // Subscribe to mills table changes
  useRealtimeSubscription('mills', 'mills');
  // Also subscribe to production_sessions to update when sessions start/stop
  useRealtimeSubscription('production_sessions', 'mills');

  return useQuery({
    queryKey: ['mills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mills')
        .select('*')
        .order('code');

      if (error) throw error;
      return data as Mill[];
    },
  });
}

export function useMill(id: string | undefined) {
  return useQuery({
    queryKey: ['mills', id],
    queryFn: async () => {
      if (!id) throw new Error('Mill ID is required');

      const { data: mill, error: millError } = await supabase
        .from('mills')
        .select('*')
        .eq('id', id)
        .single();

      if (millError) throw millError;

      // Fetch separators
      const { data: separators, error: separatorsError } = await supabase
        .from('separators')
        .select('*')
        .eq('mill_id', id)
        .order('number');

      if (separatorsError) throw separatorsError;

      // Fetch silos
      const { data: silos, error: silosError } = await supabase
        .from('silos')
        .select('*')
        .eq('mill_id', id)
        .order('code');

      if (silosError) throw silosError;

      return {
        ...mill,
        separators,
        silos,
      } as MillWithRelations;
    },
    enabled: !!id,
  });
}

export function useActiveMills() {
  return useQuery({
    queryKey: ['mills', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mills')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data as Mill[];
    },
  });
}

export function useUpdateMill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mill> }) => {
      const { data, error } = await supabase
        .from('mills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mills'] });
    },
  });
}
