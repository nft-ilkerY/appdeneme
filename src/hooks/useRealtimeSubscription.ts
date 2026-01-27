import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    // Subscribe to changes
    channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          // Invalidate query to refetch data
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, queryClient, queryKey]);
}
