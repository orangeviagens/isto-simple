export type RealtimeEvent =
  | 'message:new'
  | 'message:status'
  | 'conversation:updated'
  | 'conversation:assigned'
  | 'agent:status'
  | 'typing:start'
  | 'typing:stop';

export interface RealtimePayload<T = unknown> {
  event: RealtimeEvent;
  data: T;
  timestamp: string;
}

export type RealtimeCallback<T = unknown> = (payload: RealtimePayload<T>) => void;

export interface RealtimeService {
  /** Connect to the realtime service */
  connect(): Promise<void>;

  /** Disconnect from the realtime service */
  disconnect(): Promise<void>;

  /** Subscribe to a specific event */
  subscribe<T = unknown>(event: RealtimeEvent, callback: RealtimeCallback<T>): () => void;

  /** Subscribe to all events for a specific conversation */
  subscribeToConversation(conversationId: string, callback: RealtimeCallback): () => void;

  /** Publish an event (e.g., typing indicator) */
  publish<T = unknown>(event: RealtimeEvent, data: T): Promise<void>;

  /** Check if connected */
  isConnected(): boolean;
}
