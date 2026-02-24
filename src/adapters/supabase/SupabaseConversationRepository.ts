// ============================================================
// Orange Messenger — Supabase Conversation Repository
// ============================================================

import { supabase } from '@/lib/supabase';
import type { Conversation, Contact } from '@/types';
import type {
  ConversationRepository,
  CreateConversationDTO,
  UpdateConversationDTO,
  ConversationFilters,
} from '@/repositories/ConversationRepository';
import type { Database } from '@/types/database';

type ConversationRow = Database['public']['Tables']['conversations']['Row'];
type ContactRow = Database['public']['Tables']['contacts']['Row'];

/** Map a Supabase row + contact to the app's Conversation type */
function toConversation(row: ConversationRow, contactRow?: ContactRow): Conversation {
  const contact: Contact = contactRow
    ? {
        id: contactRow.id,
        name: contactRow.name,
        phone: contactRow.phone,
        email: contactRow.email ?? undefined,
        crmId: contactRow.zoho_crm_id ?? undefined,
        tags: contactRow.tags ?? [],
        leadStatus: ((contactRow.metadata as Record<string, unknown>)?.leadStatus as Contact['leadStatus']) ?? 'new',
        assignedAgent: ((contactRow.metadata as Record<string, unknown>)?.assignedAgent as string) ?? undefined,
        firstContactDate: contactRow.created_at,
        lastMessageDate: contactRow.updated_at,
        travelHistory: ((contactRow.metadata as Record<string, unknown>)?.travelHistory as Contact['travelHistory']) ?? [],
      }
    : {
        id: row.contact_id,
        name: 'Unknown',
        phone: '',
        tags: [],
        leadStatus: 'new',
        firstContactDate: row.created_at,
        lastMessageDate: row.updated_at,
        travelHistory: [],
      };

  return {
    id: row.id,
    contact,
    messages: [], // Messages are loaded separately
    unreadCount: row.unread_count,
    lastMessage: row.last_message_preview ?? '',
    lastMessageTime: row.last_message_at ?? row.updated_at,
    assignedAgentId: row.assigned_agent_id ?? undefined,
  };
}

export class SupabaseConversationRepository implements ConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    const contactData = (data as Record<string, unknown>).contacts as ContactRow | undefined;
    return toConversation(data, contactData ?? undefined);
  }

  async findByContactId(contactId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('contact_id', contactId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    const contactData = (data as Record<string, unknown>).contacts as ContactRow | undefined;
    return toConversation(data, contactData ?? undefined);
  }

  async create(dto: CreateConversationDTO): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        contact_id: dto.contactId,
        assigned_agent_id: dto.assignedAgentId ?? null,
        channel: (dto.channel ?? 'whatsapp') as 'whatsapp' | 'web' | 'internal',
        status: (dto.status ?? 'open') as 'open' | 'waiting' | 'closed',
      })
      .select('*, contacts(*)')
      .single();

    if (error || !data) throw new Error(`Failed to create conversation: ${error?.message}`);
    const contactData = (data as Record<string, unknown>).contacts as ContactRow | undefined;
    return toConversation(data, contactData ?? undefined);
  }

  async update(id: string, dto: UpdateConversationDTO): Promise<Conversation> {
    const updateData: Record<string, unknown> = {};
    if (dto.assignedAgentId !== undefined) updateData.assigned_agent_id = dto.assignedAgentId;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.unreadCount !== undefined) updateData.unread_count = dto.unreadCount;
    if (dto.lastMessage !== undefined) updateData.last_message_preview = dto.lastMessage;
    if (dto.lastMessageTime !== undefined) updateData.last_message_at = dto.lastMessageTime;

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select('*, contacts(*)')
      .single();

    if (error || !data) throw new Error(`Failed to update conversation: ${error?.message}`);
    const contactData = (data as Record<string, unknown>).contacts as ContactRow | undefined;
    return toConversation(data, contactData ?? undefined);
  }

  async list(filters?: ConversationFilters, limit = 50, offset = 0): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select('*, contacts(*)')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedAgentId) {
      query = query.eq('assigned_agent_id', filters.assignedAgentId);
    }
    if (filters?.unreadOnly) {
      query = query.gt('unread_count', 0);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list conversations: ${error.message}`);
    return (data ?? []).map((row) => {
      const contactData = (row as Record<string, unknown>).contacts as ContactRow | undefined;
      return toConversation(row, contactData ?? undefined);
    });
  }

  async count(filters?: ConversationFilters): Promise<number> {
    let query = supabase.from('conversations').select('*', { count: 'exact', head: true });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.assignedAgentId) query = query.eq('assigned_agent_id', filters.assignedAgentId);

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count conversations: ${error.message}`);
    return count ?? 0;
  }

  async getOpenByAgent(agentId: string): Promise<Conversation[]> {
    return this.list({ assignedAgentId: agentId, status: 'open' });
  }

  async getUnassigned(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contacts(*)')
      .is('assigned_agent_id', null)
      .eq('status', 'open')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get unassigned: ${error.message}`);
    return (data ?? []).map((row) => {
      const contactData = (row as Record<string, unknown>).contacts as ContactRow | undefined;
      return toConversation(row, contactData ?? undefined);
    });
  }
}
