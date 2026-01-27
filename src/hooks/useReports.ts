import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface ProductionReport {
  mill_id: string;
  mill_code: string;
  mill_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  total_quantity: number;
  total_duration_hours: number;
  session_count: number;
  avg_hourly_rate: number;
}

export interface PackagingReport {
  silo_id: string;
  silo_code: string;
  silo_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  package_type: string;
  total_quantity: number;
  total_bags: number;
  entry_count: number;
}

export interface SiloReport {
  silo_id: string;
  silo_code: string;
  silo_name: string;
  current_level_percent: number;
  current_level_tons: number;
  capacity_tons: number;
  total_production: number;
  total_packaging: number;
  net_change: number;
}

export interface WorkerReport {
  worker_id: string;
  worker_name: string;
  total_quantity: number;
  total_bags: number;
  entry_count: number;
  days_active: number;
  avg_per_day: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

// Production Report
export function useProductionReport(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ['production_report', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_sessions')
        .select(`
          id,
          mill_id,
          product_id,
          hourly_rate_tons,
          started_at,
          ended_at,
          mill:mills(code, name),
          product:products(code, name, micron)
        `)
        .gte('started_at', dateRange.startDate.toISOString())
        .lte('started_at', dateRange.endDate.toISOString())
        .not('ended_at', 'is', null);

      if (error) throw error;

      // Group by mill and product
      const grouped = data.reduce((acc, session) => {
        const key = `${session.mill_id}-${session.product_id}`;
        if (!acc[key]) {
          acc[key] = {
            mill_id: session.mill_id,
            mill_code: session.mill?.code || '',
            mill_name: session.mill?.name || '',
            product_id: session.product_id,
            product_code: session.product?.code || '',
            product_name: session.product?.name || '',
            total_quantity: 0,
            total_duration_hours: 0,
            session_count: 0,
            avg_hourly_rate: 0,
          };
        }

        const duration =
          (new Date(session.ended_at!).getTime() - new Date(session.started_at).getTime()) /
          (1000 * 60 * 60);

        const quantity = duration * session.hourly_rate_tons;
        acc[key].total_quantity += quantity;
        acc[key].total_duration_hours += duration;
        acc[key].session_count += 1;

        return acc;
      }, {} as Record<string, ProductionReport>);

      // Calculate average hourly rate
      const result = Object.values(grouped).map((item) => ({
        ...item,
        avg_hourly_rate:
          item.total_duration_hours > 0
            ? item.total_quantity / item.total_duration_hours
            : 0,
      }));

      return result;
    },
  });
}

// Packaging Report
export function usePackagingReport(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ['packaging_report', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packaging_entries')
        .select(`
          id,
          silo_id,
          product_id,
          package_type,
          quantity_tons,
          quantity_bags,
          recorded_at,
          silo:silos(code, name),
          product:products(code, name, micron)
        `)
        .gte('recorded_at', dateRange.startDate.toISOString())
        .lte('recorded_at', dateRange.endDate.toISOString());

      if (error) throw error;

      // Group by silo, product, and package type
      const grouped = data.reduce((acc, entry) => {
        const key = `${entry.silo_id}-${entry.product_id}-${entry.package_type}`;
        if (!acc[key]) {
          acc[key] = {
            silo_id: entry.silo_id,
            silo_code: entry.silo?.code || '',
            silo_name: entry.silo?.name || '',
            product_id: entry.product_id,
            product_code: entry.product?.code || '',
            product_name: entry.product?.name || '',
            package_type: entry.package_type,
            total_quantity: 0,
            total_bags: 0,
            entry_count: 0,
          };
        }

        acc[key].total_quantity += entry.quantity_tons;
        acc[key].total_bags += entry.quantity_bags || 0;
        acc[key].entry_count += 1;

        return acc;
      }, {} as Record<string, PackagingReport>);

      return Object.values(grouped);
    },
  });
}

// Silo Report
export function useSiloReport(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ['silo_report', dateRange],
    queryFn: async () => {
      // Get current silo levels
      const { data: silos, error: silosError } = await supabase
        .from('silos')
        .select('id, code, name, current_level_percent, current_level_tons, capacity_tons')
        .eq('is_active', true);

      if (silosError) throw silosError;

      // Get production data
      const { data: production, error: prodError } = await supabase
        .from('production_sessions')
        .select('target_silo_id, hourly_rate_tons, started_at, ended_at')
        .gte('started_at', dateRange.startDate.toISOString())
        .lte('started_at', dateRange.endDate.toISOString())
        .not('ended_at', 'is', null);

      if (prodError) throw prodError;

      // Get packaging data
      const { data: packaging, error: packError } = await supabase
        .from('packaging_entries')
        .select('silo_id, quantity_tons')
        .gte('recorded_at', dateRange.startDate.toISOString())
        .lte('recorded_at', dateRange.endDate.toISOString());

      if (packError) throw packError;

      // Calculate totals per silo
      const result: SiloReport[] = silos.map((silo) => {
        const totalProduction = production
          .filter((p) => p.target_silo_id === silo.id)
          .reduce((sum, p) => {
            const duration = (new Date(p.ended_at!).getTime() - new Date(p.started_at).getTime()) / (1000 * 60 * 60);
            const quantity = duration * p.hourly_rate_tons;
            return sum + quantity;
          }, 0);

        const totalPackaging = packaging
          .filter((p) => p.silo_id === silo.id)
          .reduce((sum, p) => sum + p.quantity_tons, 0);

        return {
          silo_id: silo.id,
          silo_code: silo.code,
          silo_name: silo.name,
          current_level_percent: silo.current_level_percent,
          current_level_tons: silo.current_level_tons,
          capacity_tons: silo.capacity_tons || 0,
          total_production: totalProduction,
          total_packaging: totalPackaging,
          net_change: totalProduction - totalPackaging,
        };
      });

      return result;
    },
  });
}

// Worker Report
export function useWorkerReport(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ['worker_report', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packaging_entries')
        .select(`
          id,
          worker_id,
          quantity_tons,
          quantity_bags,
          recorded_at,
          worker:users!packaging_entries_worker_id_fkey(full_name)
        `)
        .gte('recorded_at', dateRange.startDate.toISOString())
        .lte('recorded_at', dateRange.endDate.toISOString());

      if (error) throw error;

      // Group by worker
      const grouped = data.reduce((acc, entry) => {
        const key = entry.worker_id;
        if (!acc[key]) {
          acc[key] = {
            worker_id: entry.worker_id,
            worker_name: entry.worker?.full_name || 'Bilinmeyen',
            total_quantity: 0,
            total_bags: 0,
            entry_count: 0,
            days_active: new Set<string>(),
          };
        }

        acc[key].total_quantity += entry.quantity_tons;
        acc[key].total_bags += entry.quantity_bags || 0;
        acc[key].entry_count += 1;
        acc[key].days_active.add(
          new Date(entry.recorded_at).toISOString().split('T')[0]
        );

        return acc;
      }, {} as Record<string, any>);

      // Calculate days and average
      const daysDiff =
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24);

      const result: WorkerReport[] = Object.values(grouped).map((item) => ({
        worker_id: item.worker_id,
        worker_name: item.worker_name,
        total_quantity: item.total_quantity,
        total_bags: item.total_bags,
        entry_count: item.entry_count,
        days_active: item.days_active.size,
        avg_per_day: item.days_active.size > 0 ? item.total_quantity / item.days_active.size : 0,
      }));

      return result.sort((a, b) => b.total_quantity - a.total_quantity);
    },
  });
}

// Quick date range helpers
export function getDateRange(
  period: 'today' | 'week' | 'month' | 'custom',
  customStart?: Date,
  customEnd?: Date
): DateRangeFilter {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };
    case 'custom':
      return {
        startDate: customStart || startOfDay(now),
        endDate: customEnd || endOfDay(now),
      };
    default:
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
  }
}
