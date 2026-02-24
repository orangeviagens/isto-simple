// ============================================================
// Orange Messenger — useMessages Hook
// ============================================================
// Fetches messages for a conversation and subscribes to
// new messages in realtime. Sends messages via Edge Function.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, MessageSender, MessageType } from '@/types';
import container from '@/container';
import { supabase } from '@/lib/supabase';
import { config } from '@/config/env';

/** Map DB sender_type to app's MessageSender */
function mapSenderType(dbType: string): MessageSender {
  const map: Record<string, MessageSender> = {
    customer: 'client',
    agent: 'agent',
    bot: 'bot',
    system: 'system',
  };
  return map[dbType] ?? 'system';
}

/** Convert a realtime payload (DB row) into a Message object */
function realtimeRowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    sender: mapSenderType(row.sender_type as string),
    content: row.content as string,
    timestamp: row.created_at as string,
    status: row.status === 'pending' || row.status === 'failed'
      ? undefined
      : (row.status as Message['status']),
    type: (row.content_type as MessageType) ?? 'text',
    fileName: (row.metadata as Record<string, unknown>)?.fileName as string | undefined,
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentConvRef = useRef(conversationId);
  const sendingRef = useRef(false); // Synchronous guard against duplicate sends

  // Keep ref in sync
  useEffect(() => {
    currentConvRef.current = conversationId;
  }, [conversationId]);

  // Initial load — only when conversationId changes
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

  // Load messages on conversation change
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription — append new messages, update status
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = container.realtime.subscribeToConversation(
      conversationId,
      (payload) => {
        // Only handle events for the current conversation
        if (currentConvRef.current !== conversationId) return;

        const data = payload.data as Record<string, unknown>;
        if (!data) return;

        if (payload.event === 'message:new') {
          const newMessage = realtimeRowToMessage(data);

          // Avoid duplicates (check by id)
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        } else if (payload.event === 'message:status') {
          // Update only the status of the specific message
          const messageId = data.id as string;
          const newStatus = data.status as Message['status'];
          setMessages(prev =>
            prev.map(m =>
              m.id === messageId ? { ...m, status: newStatus } : m
            )
          );
        }
        // Ignore conversation:updated, typing events — they don't affect messages
      }
    );

    return unsubscribe;
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, contactPhone: string, senderName?: string) => {
      if (!conversationId || !content.trim()) return;

      // Synchronous ref guard — prevents duplicate sends before React re-renders
      if (sendingRef.current) return;
      sendingRef.current = true;

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

        // The realtime subscription will handle adding the message to state
        // No need to refetch all messages
        return result.message as Message;
      } catch (err) {
        console.error('[useMessages] Send failed:', err);
        const errorMsg = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(errorMsg);
        throw err;
      } finally {
        setSending(false);
        sendingRef.current = false;
      }
    },
    [conversationId]
  );

  return { messages, loading, sending, error, sendMessage, refetch: fetchMessages };
}
