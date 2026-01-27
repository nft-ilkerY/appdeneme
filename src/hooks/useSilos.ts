import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Silo, SiloWithRelations } from '@/types';

export function useSilos(millId?: string) {
  return useQuery({
    queryKey: ['silos', millId],
    queryFn: async () => {
      let query = supabase
        .from('silos')
        .select('*, mill:mills(*)')
        .order('code');

      if (millId) {
        query = query.eq('mill_id', millId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SiloWithRelations[];
    },
  });
}

export function useActiveSilos(millId?: string) {
  return useQuery({
    queryKey: ['silos', 'active', millId],
    queryFn: async () => {
      let query = supabase
        .from('silos')
        .select('*, mill:mills(*)')
        .eq('is_active', true)
        .order('code');

      if (millId) {
        query = query.eq('mill_id', millId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SiloWithRelations[];
    },
  });
}

export function useSilo(id: string | undefined) {
  return useQuery({
    queryKey: ['silos', id],
    queryFn: async () => {
      if (!id) throw new Error('Silo ID is required');

      const { data, error } = await supabase
        .from('silos')
        .select('*, mill:mills(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SiloWithRelations;
    },
    enabled: !!id,
  });
}

export function useSiloProductRules(siloId: string | undefined) {
  return useQuery({
    queryKey: ['silo_product_rules', siloId],
    queryFn: async () => {
      if (!siloId) throw new Error('Silo ID is required');

      const { data, error } = await supabase
        .from('silo_product_rules')
        .select('*, product:products(*)')
        .eq('silo_id', siloId);

      if (error) throw error;
      return data;
    },
    enabled: !!siloId,
  });
}

export function useUpdateSiloLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siloId,
      levelPercent,
      levelTons,
      recordedBy,
      notes,
    }: {
      siloId: string;
      levelPercent: number;
      levelTons?: number;
      recordedBy: string;
      notes?: string;
    }) => {
      // Update silo
      const { error: siloError } = await supabase
        .from('silos')
        .update({
          current_level_percent: levelPercent,
          current_level_tons: levelTons || 0,
        })
        .eq('id', siloId);

      if (siloError) throw siloError;

      // Log the level change
      const { data, error: logError } = await supabase
        .from('silo_level_logs')
        .insert({
          silo_id: siloId,
          level_percent: levelPercent,
          level_tons: levelTons,
          source: 'manual',
          recorded_by: recordedBy,
          notes,
        })
        .select()
        .single();

      if (logError) throw logError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silos'] });
    },
  });
}
