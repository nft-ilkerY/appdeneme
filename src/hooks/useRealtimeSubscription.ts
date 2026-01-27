import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(table: string, queryKeyPrefix: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    console.log(`🔴 [Realtime] Subscribing to table: ${table}`);

    // Subscribe to changes
    channel = supabase
      .channel(`${table}_changes_${Math.random()}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`🟢 [Realtime] Update received on ${table}:`, payload.eventType, payload);

          // Invalidate ALL queries that match the prefix
          queryClient.invalidateQueries({
            queryKey: [queryKeyPrefix],
            refetchType: 'active' // Only refetch active queries
          });
        }
      )
      .subscribe((status) => {
        console.log(`🔵 [Realtime] Subscription status for ${table}:`, status);
      });

    // Cleanup
    return () => {
      console.log(`🟡 [Realtime] Unsubscribing from ${table}`);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, queryClient, queryKeyPrefix]);
}
