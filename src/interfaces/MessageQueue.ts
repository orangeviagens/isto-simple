export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface MessageQueue {
  /** Add a message to the queue */
  enqueue<T>(type: string, payload: T, maxAttempts?: number): Promise<string>;

  /** Get the next message from the queue (or null if empty) */
  dequeue(): Promise<QueueMessage | null>;

  /** Mark a message as successfully processed */
  acknowledge(id: string): Promise<void>;

  /** Mark a message as failed (will be retried or sent to DLQ) */
  reject(id: string, error: string): Promise<void>;

  /** Get the number of pending messages */
  size(): Promise<number>;

  /** Process messages with a handler (continuous loop) */
  process(handler: (message: QueueMessage) => Promise<void>): () => void;
}
