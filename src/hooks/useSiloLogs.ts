import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useSiloLevelLogs(siloId: string | undefined, limit = 100) {
  return useQuery({
    queryKey: ['silo_level_logs', siloId, limit],
    queryFn: async () => {
      if (!siloId) throw new Error('Silo ID is required');

      const { data, error } = await supabase
        .from('silo_level_logs')
        .select('*, recorded_by:users(full_name)')
        .eq('silo_id', siloId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!siloId,
  });
}

export function useSiloLevelHistory(siloId: string | undefined, days = 7) {
  return useQuery({
    queryKey: ['silo_level_history', siloId, days],
    queryFn: async () => {
      if (!siloId) throw new Error('Silo ID is required');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('silo_level_logs')
        .select('recorded_at, level_percent, level_tons')
        .eq('silo_id', siloId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!siloId,
  });
}
