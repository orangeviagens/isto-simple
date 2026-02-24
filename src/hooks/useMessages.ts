// ============================================================
// Orange Messenger — useMessages Hook
// ============================================================
// Fetches messages for a conversation and subscribes to
// new messages in realtime. Sends messages via Edge Function.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/types';
import container from '@/container';
import { supabase } from '@/lib/supabase';
import { config } from '@/config/env';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
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
    async (content: string, contactPhone: string, senderName?: string) => {
      if (!conversationId || !content.trim()) return;

      setSending(true);
      setError(null);

      try {
        // Get current auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Não autenticado. Faça login novamente.');
        }

        // Call send-message Edge Function
        const response = await fetch(
          `${config.supabase.url}/functions/v1/send-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': config.supabase.anonKey,
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              to: contactPhone,
              message: content,
              type: 'text',
              sender_name: senderName || session.user?.email || 'Agente',
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao enviar mensagem');
        }

        // Refetch messages to get the saved message from DB
        await fetchMessages();

        return result.message as Message;
      } catch (err) {
        console.error('[useMessages] Send failed:', err);
        const errorMsg = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(errorMsg);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [conversationId, fetchMessages]
  );

  return { messages, loading, sending, error, sendMessage, refetch: fetchMessages };
}
