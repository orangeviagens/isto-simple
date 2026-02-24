// ============================================================
// Orange Messenger — useMessages Hook
// ============================================================
// Fetches messages for a conversation and subscribes to
// new messages in realtime.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/types';
import container from '@/container';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const data = await container.messageRepo.listByConversation(conversationId, 100);
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('[useMessages] Failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();

    if (!conversationId) return;

    // Subscribe to new messages for this conversation
    const unsubscribe = container.realtime.subscribeToConversation(
      conversationId,
      () => {
        fetchMessages();
      }
    );

    return unsubscribe;
  }, [conversationId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, type: Message['type'] = 'text') => {
      if (!conversationId) return;

      const newMsg = await container.messageRepo.create({
        conversationId,
        sender: 'agent',
        content,
        type,
      });

      setMessages((prev) => [...prev, newMsg]);
      return newMsg;
    },
    [conversationId]
  );

  return { messages, loading, error, sendMessage, refetch: fetchMessages };
}
