import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type FlowNode = Database['public']['Tables']['flow_nodes']['Row'];
type FlowNodeInsert = Database['public']['Tables']['flow_nodes']['Insert'];
type FlowNodeUpdate = Database['public']['Tables']['flow_nodes']['Update'];

type FlowConnection = Database['public']['Tables']['flow_connections']['Row'];
type FlowConnectionInsert = Database['public']['Tables']['flow_connections']['Insert'];

// Flow Nodes (pozisyonlar)
export function useFlowNodes() {
  return useQuery({
    queryKey: ['flow_nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flow_nodes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FlowNode[];
    },
  });
}

export function useCreateFlowNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (node: FlowNodeInsert) => {
      const { data, error } = await supabase
        .from('flow_nodes')
        .insert(node)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
    },
  });
}

export function useUpdateFlowNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FlowNodeUpdate }) => {
      const { data, error } = await supabase
        .from('flow_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
    },
  });
}

export function useUpdateFlowNodePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityId,
      entityType,
      position_x,
      position_y,
    }: {
      entityId: string;
      entityType: 'mill' | 'silo' | 'coating' | 'output';
      position_x: number;
      position_y: number;
    }) => {
      const { data, error } = await supabase
        .from('flow_nodes')
        .update({ position_x, position_y })
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
    },
  });
}

// Flow Connections (bağlantılar)
export function useFlowConnections() {
  return useQuery({
    queryKey: ['flow_connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flow_connections')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FlowConnection[];
    },
  });
}

export function useCreateFlowConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connection: FlowConnectionInsert) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('flow_connections')
        .insert({
          ...connection,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow_connections'] });
    },
  });
}

export function useDeleteFlowConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flow_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow_connections'] });
    },
  });
}

// Tüm entity'leri getir (Mill, Silo, Coating, Output)
export function useAllEntities() {
  return useQuery({
    queryKey: ['all_entities'],
    queryFn: async () => {
      // Paralel olarak tüm entity'leri çek
      const [millsRes, silosRes] = await Promise.all([
        supabase.from('mills').select('*'),
        supabase.from('silos').select('*'),
      ]);

      if (millsRes.error) throw millsRes.error;
      if (silosRes.error) throw silosRes.error;

      return {
        mills: millsRes.data || [],
        silos: silosRes.data || [],
        // coating ve output eklenecek
      };
    },
  });
}
