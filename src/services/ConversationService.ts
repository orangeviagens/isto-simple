import type { Conversation, Message } from '@/types';
import type { ConversationRepository, ConversationFilters, ConversationStatus } from '@/repositories';
import type { MessageRepository, CreateMessageDTO } from '@/repositories';
import type { ContactRepository } from '@/repositories';
import type { RealtimeService } from '@/interfaces';
import type { CacheService } from '@/interfaces';

export class ConversationService {
  constructor(
    private conversations: ConversationRepository,
    private messages: MessageRepository,
    private contacts: ContactRepository,
    private realtime: RealtimeService,
    private cache: CacheService,
  ) {}

  /** Get all conversations with optional filters */
  async list(filters?: ConversationFilters, limit = 50): Promise<Conversation[]> {
    return this.conversations.list(filters, limit);
  }

  /** Get a single conversation by ID, with caching */
  async getById(id: string): Promise<Conversation | null> {
    const cacheKey = `conversation:${id}`;
    const cached = await this.cache.get<Conversation>(cacheKey);
    if (cached) return cached;

    const conversation = await this.conversations.findById(id);
    if (conversation) {
      await this.cache.set(cacheKey, conversation, 300); // 5 min cache
    }
    return conversation;
  }

  /** Assign a conversation to an agent */
  async assign(conversationId: string, agentId: string): Promise<Conversation> {
    const updated = await this.conversations.update(conversationId, {
      assignedAgentId: agentId,
      status: 'open' as ConversationStatus,
    });
    await this.cache.delete(`conversation:${conversationId}`);
    await this.realtime.publish('conversation:assigned', { conversationId, agentId });
    return updated;
  }

  /** Close a conversation */
  async close(conversationId: string): Promise<Conversation> {
    const updated = await this.conversations.update(conversationId, {
      status: 'closed' as ConversationStatus,
    });
    await this.cache.delete(`conversation:${conversationId}`);
    return updated;
  }

  /** Transfer a conversation to another agent */
  async transfer(conversationId: string, newAgentId: string): Promise<Conversation> {
    return this.assign(conversationId, newAgentId);
  }

  /** Get messages for a conversation (paginated) */
  async getMessages(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
    return this.messages.listByConversation(conversationId, limit, before);
  }

  /** Send a message in a conversation */
  async sendMessage(data: CreateMessageDTO): Promise<Message> {
    const message = await this.messages.create(data);

    // Update conversation's last message
    await this.conversations.update(data.conversationId, {
      lastMessage: data.content,
      lastMessageTime: new Date().toISOString(),
    });

    await this.cache.delete(`conversation:${data.conversationId}`);
    await this.realtime.publish('message:new', message);

    return message;
  }

  /** Mark all messages as read in a conversation */
  async markAsRead(conversationId: string): Promise<void> {
    await this.conversations.update(conversationId, { unreadCount: 0 });
    await this.cache.delete(`conversation:${conversationId}`);
  }

  /** Get open conversations count by agent */
  async getOpenCountByAgent(agentId: string): Promise<number> {
    return this.conversations.count({
      assignedAgentId: agentId,
      status: 'open' as ConversationStatus,
    });
  }

  /** Get unassigned conversations */
  async getUnassigned(): Promise<Conversation[]> {
    return this.conversations.getUnassigned();
  }
}
