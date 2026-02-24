// ============================================================
// Orange Messenger — useConversations Hook
// ============================================================
// Fetches conversations from Supabase and subscribes to
// realtime updates.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types';
import container from '@/container';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await container.conversationRepo.list({ status: 'open' });
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('[useConversations] Failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Subscribe to realtime conversation updates
    const unsubscribe = container.realtime.subscribe('conversation:updated', () => {
      fetchConversations();
    });

    return unsubscribe;
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
