import type { Message, MessageSender, MessageStatus, MessageType } from '@/types';

export interface CreateMessageDTO {
  conversationId: string;
  sender: MessageSender;
  senderName?: string;
  content: string;
  type: MessageType;
  status?: MessageStatus;
  mediaUrl?: string;
  fileName?: string;
  waMessageId?: string;  // WhatsApp Cloud API message ID
}

export interface UpdateMessageDTO {
  status?: MessageStatus;
  content?: string;
}

export interface MessageFilters {
  conversationId: string;
  sender?: MessageSender;
  type?: MessageType;
  after?: string;   // ISO timestamp
  before?: string;  // ISO timestamp
}

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByWaMessageId(waMessageId: string): Promise<Message | null>;
  create(data: CreateMessageDTO): Promise<Message>;
  update(id: string, data: UpdateMessageDTO): Promise<Message>;
  listByConversation(conversationId: string, limit?: number, before?: string): Promise<Message[]>;
  count(filters: MessageFilters): Promise<number>;
  getLatest(conversationId: string): Promise<Message | null>;
}
