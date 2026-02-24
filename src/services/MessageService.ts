import type { Message } from '@/types';
import type { MessageRepository, CreateMessageDTO } from '@/repositories';
import type { ConversationRepository } from '@/repositories';
import type { WhatsAppService } from '@/interfaces';
import type { RealtimeService } from '@/interfaces';
import type { AIService } from '@/interfaces';

export class MessageService {
  constructor(
    private messages: MessageRepository,
    private conversations: ConversationRepository,
    private whatsapp: WhatsAppService,
    private realtime: RealtimeService,
    private ai: AIService,
  ) {}

  /** Send a message from an agent to a customer via WhatsApp */
  async sendToCustomer(conversationId: string, content: string, agentName: string): Promise<Message> {
    // Get conversation to find the contact's phone
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) throw new Error(`Conversation ${conversationId} not found`);

    // Send via WhatsApp Cloud API
    const waMessageId = await this.whatsapp.sendText(conversation.contact.phone, content);

    // Save to database
    const message = await this.messages.create({
      conversationId,
      sender: 'agent',
      senderName: agentName,
      content,
      type: 'text',
      status: 'sent',
      waMessageId,
    });

    // Update conversation
    await this.conversations.update(conversationId, {
      lastMessage: content,
      lastMessageTime: new Date().toISOString(),
    });

    // Notify via realtime
    await this.realtime.publish('message:new', message);

    return message;
  }

  /** Process an incoming message from WhatsApp webhook */
  async processIncoming(
    phone: string,
    content: string,
    type: CreateMessageDTO['type'],
    waMessageId: string,
    mediaUrl?: string,
  ): Promise<Message> {
    // Find or create conversation for this phone
    // (This would be handled by LeadSyncService in a full implementation)

    // Mark as read on WhatsApp
    await this.whatsapp.markAsRead(waMessageId);

    // Save the incoming message
    // Note: conversationId would come from the contact lookup
    const message = await this.messages.create({
      conversationId: '', // To be resolved by the caller
      sender: 'client',
      content,
      type,
      waMessageId,
      mediaUrl,
    });

    return message;
  }

  /** Update message delivery status from WhatsApp webhook */
  async updateStatus(waMessageId: string, status: 'sent' | 'delivered' | 'read' | 'failed'): Promise<void> {
    const message = await this.messages.findByWaMessageId(waMessageId);
    if (!message) return;

    await this.messages.update(message.id, { status });
    await this.realtime.publish('message:status', { messageId: message.id, status });
  }

  /** Get AI-suggested reply for a conversation */
  async getSuggestion(conversationId: string, agentName: string): Promise<string> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) throw new Error(`Conversation ${conversationId} not found`);

    const result = await this.ai.suggestReply({
      conversationHistory: conversation.messages.slice(-10), // Last 10 messages
      contactName: conversation.contact.name,
      contactTags: conversation.contact.tags,
      agentName,
    });

    return result.suggestion;
  }
}
