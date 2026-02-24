// ============================================================
// Orange Messenger — useConversations Hook
// ============================================================
// Fetches conversations from Supabase and subscribes to
// realtime updates. Updates incrementally instead of
// re-fetching the entire list.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types';
import container from '@/container';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await container.conversationRepo.list({ status: 'open' });
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('[useConversations] Failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription — incremental updates
  useEffect(() => {
    const unsubConv = container.realtime.subscribe('conversation:updated', (payload) => {
      const data = payload.data as Record<string, unknown>;
      if (!data?.id) return;

      const convId = data.id as string;

      setConversations(prev => {
        const existing = prev.find(c => c.id === convId);
        if (existing) {
          // Update existing conversation in-place
          return prev.map(c => {
            if (c.id !== convId) return c;
            return {
              ...c,
              lastMessage: (data.last_message_preview as string) ?? c.lastMessage,
              lastMessageTime: (data.last_message_at as string) ?? c.lastMessageTime,
              status: (data.status as Conversation['status']) ?? c.status,
              unreadCount: data.unread_count != null
                ? (data.unread_count as number)
                : c.unreadCount,
            };
          });
        } else {
          // New conversation — fetch all to get complete data
          // (this is rare, only when a brand new conversation is created)
          fetchConversations(true);
          return prev;
        }
      });
    });

    // Also listen for new messages to update sidebar preview/timestamp
    const unsubMsg = container.realtime.subscribe('message:new', (payload) => {
      const data = payload.data as Record<string, unknown>;
      if (!data?.conversation_id) return;

      const convId = data.conversation_id as string;
      const content = data.content as string;
      const timestamp = data.created_at as string;
      const senderType = data.sender_type as string;

      setConversations(prev => {
        const existing = prev.find(c => c.id === convId);
        if (!existing) {
          // New conversation from an unknown contact — fetch full list
          fetchConversations(true);
          return prev;
        }

        return prev.map(c => {
          if (c.id !== convId) return c;
          return {
            ...c,
            lastMessage: content?.substring(0, 200) ?? c.lastMessage,
            lastMessageTime: timestamp ?? c.lastMessageTime,
            // Increment unread only for incoming (customer) messages
            unreadCount: senderType === 'customer'
              ? (c.unreadCount ?? 0) + 1
              : c.unreadCount,
          };
        });
      });
    });

    return () => {
      unsubConv();
      unsubMsg();
    };
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
