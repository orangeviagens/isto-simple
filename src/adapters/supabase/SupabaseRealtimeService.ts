// ============================================================
// Orange Messenger — Supabase Realtime Service
// ============================================================
// Uses Supabase Realtime (built on PostgreSQL's NOTIFY/LISTEN)
// for real-time updates on conversations and messages.
// ============================================================

import { supabase } from '@/lib/supabase';
import type {
  RealtimeService,
  RealtimeEvent,
  RealtimeCallback,
  RealtimePayload,
} from '@/interfaces';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class SupabaseRealtimeService implements RealtimeService {
  private listeners = new Map<string, Set<RealtimeCallback>>();
  private channels: RealtimeChannel[] = [];
  private connected = false;

  async connect(): Promise<void> {
    // Subscribe to conversations changes
    const convChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          const event: RealtimeEvent =
            payload.eventType === 'INSERT'
              ? 'conversation:updated'
              : 'conversation:updated';

          this.emit(event, {
            event,
            data: payload.new,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const msgChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          this.emit('message:new', {
            event: 'message:new',
            data: payload.new,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          this.emit('message:status', {
            event: 'message:status',
            data: payload.new,
            timestamp: new Date().toISOString(),
          });
        }
      )
      .subscribe();

    this.channels.push(convChannel, msgChannel);
    this.connected = true;
    console.log('[Realtime] Connected (Supabase)');
  }

  async disconnect(): Promise<void> {
    for (const channel of this.channels) {
      await supabase.removeChannel(channel);
    }
    this.channels = [];
    this.listeners.clear();
    this.connected = false;
    console.log('[Realtime] Disconnected (Supabase)');
  }

  subscribe<T = unknown>(event: RealtimeEvent, callback: RealtimeCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const typedCallback = callback as RealtimeCallback;
    this.listeners.get(event)!.add(typedCallback);

    return () => {
      this.listeners.get(event)?.delete(typedCallback);
    };
  }

  subscribeToConversation(conversationId: string, callback: RealtimeCallback): () => void {
    const wrappedCallback: RealtimeCallback = (payload) => {
      const data = payload.data as Record<string, unknown>;
      if (
        data?.conversation_id === conversationId ||
        data?.id === conversationId
      ) {
        callback(payload);
      }
    };

    const unsubs = [
      this.subscribe('message:new', wrappedCallback),
      this.subscribe('message:status', wrappedCallback),
      this.subscribe('conversation:updated', wrappedCallback),
      this.subscribe('typing:start', wrappedCallback),
      this.subscribe('typing:stop', wrappedCallback),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }

  async publish<T = unknown>(event: RealtimeEvent, data: T): Promise<void> {
    // For Supabase, writes to DB automatically trigger realtime events.
    // This method can be used for custom events via broadcast.
    const payload: RealtimePayload<T> = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    // Also emit locally for immediate UI updates
    this.emit(event, payload as RealtimePayload);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emit(event: RealtimeEvent, payload: RealtimePayload): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }
}
