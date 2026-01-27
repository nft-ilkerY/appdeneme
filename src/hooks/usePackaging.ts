import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PackagingEntry, PackagingEntryWithRelations } from '@/types';

export function usePackagingEntries(filters?: {
  siloId?: string;
  workerId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['packaging_entries', filters],
    queryFn: async () => {
      let query = supabase
        .from('packaging_entries')
        .select(`
          *,
          silo:silos(code, name),
          product:products(code, name, micron),
          worker:users!packaging_entries_worker_id_fkey(full_name),
          creator:users!packaging_entries_created_by_fkey(full_name)
        `)
        .order('recorded_at', { ascending: false });

      if (filters?.siloId) {
        query = query.eq('silo_id', filters.siloId);
      }

      if (filters?.workerId) {
        query = query.eq('worker_id', filters.workerId);
      }

      if (filters?.startDate) {
        query = query.gte('recorded_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('recorded_at', filters.endDate);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as PackagingEntryWithRelations[];
    },
  });
}

export function useTodayPackaging() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return useQuery({
    queryKey: ['packaging_entries', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packaging_entries')
        .select(`
          *,
          silo:silos(code, name),
          product:products(code, name),
          worker:users!packaging_entries_worker_id_fkey(full_name)
        `)
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as PackagingEntryWithRelations[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCreatePackagingEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      silo_id: string;
      product_id: string;
      worker_id: string;
      package_type: 'BB' | 'PP' | 'KRAFT';
      quantity_tons: number;
      quantity_bags?: number;
      shift?: string;
      notes?: string;
      created_by: string;
    }) => {
      // Insert packaging entry
      const { data, error } = await supabase
        .from('packaging_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;

      // Update silo level (decrease)
      const { data: silo } = await supabase
        .from('silos')
        .select('current_level_tons, capacity_tons, id')
        .eq('id', entry.silo_id)
        .single();

      if (silo) {
        const newLevelTons = Math.max(0, silo.current_level_tons - entry.quantity_tons);
        const newLevelPercent = silo.capacity_tons
          ? (newLevelTons / silo.capacity_tons) * 100
          : 0;

        await supabase
          .from('silos')
          .update({
            current_level_tons: newLevelTons,
            current_level_percent: newLevelPercent,
          })
          .eq('id', silo.id);

        // Log silo level change
        await supabase.from('silo_level_logs').insert({
          silo_id: silo.id,
          level_percent: newLevelPercent,
          level_tons: newLevelTons,
          source: 'calculated',
          recorded_by: entry.created_by,
          notes: `Paketleme: ${entry.quantity_tons} ton ${entry.package_type}`,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging_entries'] });
      queryClient.invalidateQueries({ queryKey: ['silos'] });
    },
  });
}

export function useWorkerPackagingStats(workerId: string, days = 30) {
  return useQuery({
    queryKey: ['packaging_stats', workerId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('packaging_entries')
        .select('quantity_tons, package_type, recorded_at')
        .eq('worker_id', workerId)
        .gte('recorded_at', startDate.toISOString());

      if (error) throw error;

      // Calculate stats
      const totalTons = data.reduce((sum, entry) => sum + entry.quantity_tons, 0);
      const byType = data.reduce((acc, entry) => {
        acc[entry.package_type] = (acc[entry.package_type] || 0) + entry.quantity_tons;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTons,
        totalEntries: data.length,
        byType,
        avgPerDay: totalTons / days,
      };
    },
    enabled: !!workerId,
  });
}
