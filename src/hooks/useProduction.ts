import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProductionSession, ProductionSessionWithRelations } from '@/types';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useProductionSessions(millId?: string) {
  useRealtimeSubscription('production_sessions', ['production_sessions', millId || 'all']);

  return useQuery({
    queryKey: ['production_sessions', millId],
    queryFn: async () => {
      let query = supabase
        .from('production_sessions')
        .select(`
          *,
          mill:mills(*),
          product:products(*),
          silo:silos(*),
          creator:users(*)
        `)
        .order('started_at', { ascending: false });

      if (millId) {
        query = query.eq('mill_id', millId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProductionSessionWithRelations[];
    },
  });
}

export function useActiveProductionSessions(millId?: string) {
  useRealtimeSubscription('production_sessions', ['production_sessions', 'active', millId || 'all']);

  return useQuery({
    queryKey: ['production_sessions', 'active', millId],
    queryFn: async () => {
      let query = supabase
        .from('production_sessions')
        .select(`
          *,
          mill:mills(*),
          product:products(*),
          silo:silos(*),
          creator:users(*)
        `)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (millId) {
        query = query.eq('mill_id', millId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProductionSessionWithRelations[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for active sessions
  });
}

export function useCreateProductionSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: {
      mill_id: string;
      product_id: string;
      target_silo_id: string;
      hourly_rate_tons: number;
      notes?: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from('production_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      // Update silo level log
      await supabase.from('silo_level_logs').insert({
        silo_id: session.target_silo_id,
        level_percent: 0, // Will be calculated
        source: 'calculated',
        production_session_id: data.id,
        recorded_by: session.created_by,
        notes: 'Production session started',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['silos'] });
    },
  });
}

export function useEndProductionSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status = 'completed',
    }: {
      id: string;
      status?: 'completed' | 'cancelled';
    }) => {
      const { data, error } = await supabase
        .from('production_sessions')
        .update({
          ended_at: new Date().toISOString(),
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_sessions'] });
    },
  });
}
