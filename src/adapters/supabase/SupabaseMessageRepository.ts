// ============================================================
// Orange Messenger — Supabase Message Repository
// ============================================================

import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';
import type {
  MessageRepository,
  CreateMessageDTO,
  UpdateMessageDTO,
  MessageFilters,
} from '@/repositories/MessageRepository';
import type { Database } from '@/types/database';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/** Map DB sender_type to app's MessageSender */
function mapSenderType(dbType: string): Message['sender'] {
  const map: Record<string, Message['sender']> = {
    customer: 'client',
    agent: 'agent',
    bot: 'bot',
    system: 'system',
  };
  return map[dbType] ?? 'system';
}

/** Map app's MessageSender to DB sender_type */
function mapSenderTypeToDb(appType: string): string {
  const map: Record<string, string> = {
    client: 'customer',
    agent: 'agent',
    bot: 'bot',
    system: 'system',
  };
  return map[appType] ?? 'system';
}

/** Map a Supabase row to the app's Message type */
function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: mapSenderType(row.sender_type),
    content: row.content,
    timestamp: row.created_at,
    status: row.status === 'pending' || row.status === 'failed' ? undefined : row.status as Message['status'],
    type: row.content_type as Message['type'],
    fileName: (row.metadata as Record<string, unknown>)?.fileName as string | undefined,
  };
}

export class SupabaseMessageRepository implements MessageRepository {
  async findById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return toMessage(data);
  }

  async findByWaMessageId(waMessageId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('wa_message_id', waMessageId)
      .single();

    if (error || !data) return null;
    return toMessage(data);
  }

  async create(dto: CreateMessageDTO): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: dto.conversationId,
        sender_type: mapSenderTypeToDb(dto.sender) as 'customer' | 'agent' | 'system' | 'bot',
        sender_id: null, // TODO: resolve sender UUID from context
        content: dto.content,
        content_type: (dto.type ?? 'text') as 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'template' | 'interactive',
        media_url: dto.mediaUrl ?? null,
        wa_message_id: dto.waMessageId ?? null,
        status: (dto.status ?? 'sent') as 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
        metadata: {
          ...(dto.senderName && { senderName: dto.senderName }),
          ...(dto.fileName && { fileName: dto.fileName }),
        },
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create message: ${error?.message}`);

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message_preview: dto.content.substring(0, 200),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', dto.conversationId);

    return toMessage(data);
  }

  async update(id: string, dto: UpdateMessageDTO): Promise<Message> {
    const updateData: Record<string, unknown> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.content !== undefined) updateData.content = dto.content;

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update message: ${error?.message}`);
    return toMessage(data);
  }

  async listByConversation(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list messages: ${error.message}`);

    // Return in chronological order (oldest first)
    return (data ?? []).map(toMessage).reverse();
  }

  async count(filters: MessageFilters): Promise<number> {
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', filters.conversationId);

    if (filters.sender) {
      query = query.eq('sender_type', mapSenderTypeToDb(filters.sender));
    }
    if (filters.after) {
      query = query.gte('created_at', filters.after);
    }
    if (filters.before) {
      query = query.lte('created_at', filters.before);
    }

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count messages: ${error.message}`);
    return count ?? 0;
  }

  async getLatest(conversationId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return toMessage(data);
  }
}
