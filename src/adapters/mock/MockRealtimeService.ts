import type { RealtimeService, RealtimeEvent, RealtimeCallback, RealtimePayload } from '@/interfaces';

/**
 * Event emitter-based realtime for MVP (local events only).
 * Enterprise: replace with SocketIOAdapter implements RealtimeService
 */
export class MockRealtimeService implements RealtimeService {
  private listeners = new Map<string, Set<RealtimeCallback>>();
  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
    console.log('[Realtime] Connected (mock)');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.listeners.clear();
    console.log('[Realtime] Disconnected (mock)');
  }

  subscribe<T = unknown>(event: RealtimeEvent, callback: RealtimeCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const typedCallback = callback as RealtimeCallback;
    this.listeners.get(event)!.add(typedCallback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(typedCallback);
    };
  }

  subscribeToConversation(conversationId: string, callback: RealtimeCallback): () => void {
    const wrappedCallback: RealtimeCallback = (payload) => {
      // Only forward events related to this conversation
      const data = payload.data as Record<string, unknown>;
      if (data?.conversationId === conversationId || data?.id === conversationId) {
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
    const payload: RealtimePayload<T> = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload as RealtimePayload));
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
