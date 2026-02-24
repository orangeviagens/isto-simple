import type { Conversation } from '@/types';

export type ConversationStatus = 'open' | 'waiting' | 'closed';

export interface CreateConversationDTO {
  contactId: string;
  assignedAgentId?: string;
  channel?: string;
  status?: ConversationStatus;
}

export interface UpdateConversationDTO {
  assignedAgentId?: string;
  status?: ConversationStatus;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ConversationFilters {
  assignedAgentId?: string;
  status?: ConversationStatus;
  unreadOnly?: boolean;
  search?: string;  // search by contact name or last message
}

export interface ConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByContactId(contactId: string): Promise<Conversation | null>;
  create(data: CreateConversationDTO): Promise<Conversation>;
  update(id: string, data: UpdateConversationDTO): Promise<Conversation>;
  list(filters?: ConversationFilters, limit?: number, offset?: number): Promise<Conversation[]>;
  count(filters?: ConversationFilters): Promise<number>;
  getOpenByAgent(agentId: string): Promise<Conversation[]>;
  getUnassigned(): Promise<Conversation[]>;
}
