// ============================================================
// Orange Messenger — Supabase Contact Repository
// ============================================================

import { supabase } from '@/lib/supabase';
import type { Contact } from '@/types';
import type {
  ContactRepository,
  CreateContactDTO,
  UpdateContactDTO,
  ContactFilters,
} from '@/repositories/ContactRepository';
import type { Database } from '@/types/database';

type ContactRow = Database['public']['Tables']['contacts']['Row'];

/** Map a Supabase row to the app's Contact type */
function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    crmId: row.zoho_crm_id ?? undefined,
    tags: row.tags ?? [],
    leadStatus: ((row.metadata as Record<string, unknown>)?.leadStatus as Contact['leadStatus']) ?? 'new',
    assignedAgent: ((row.metadata as Record<string, unknown>)?.assignedAgent as string) ?? undefined,
    firstContactDate: row.created_at,
    lastMessageDate: row.updated_at,
    travelHistory: ((row.metadata as Record<string, unknown>)?.travelHistory as Contact['travelHistory']) ?? [],
  };
}

export class SupabaseContactRepository implements ContactRepository {
  async findById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return toContact(data);
  }

  async findByPhone(phone: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data) return null;
    return toContact(data);
  }

  async findByCrmId(crmId: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('zoho_crm_id', crmId)
      .single();

    if (error || !data) return null;
    return toContact(data);
  }

  async create(dto: CreateContactDTO): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        zoho_crm_id: dto.crmId ?? null,
        tags: dto.tags ?? [],
        metadata: {
          leadStatus: dto.leadStatus ?? 'new',
          assignedAgent: dto.assignedAgent ?? null,
          travelHistory: [],
        },
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create contact: ${error?.message}`);
    return toContact(data);
  }

  async update(id: string, dto: UpdateContactDTO): Promise<Contact> {
    // First get existing metadata
    const existing = await this.findById(id);
    const existingMeta = existing ? {
      leadStatus: existing.leadStatus,
      assignedAgent: existing.assignedAgent,
      travelHistory: existing.travelHistory,
    } : {};

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.crmId !== undefined) updateData.zoho_crm_id = dto.crmId;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    // Merge metadata fields
    updateData.metadata = {
      ...existingMeta,
      ...(dto.leadStatus !== undefined && { leadStatus: dto.leadStatus }),
      ...(dto.assignedAgent !== undefined && { assignedAgent: dto.assignedAgent }),
    };

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update contact: ${error?.message}`);
    return toContact(data);
  }

  async list(filters?: ContactFilters, limit = 50, offset = 0): Promise<Contact[]> {
    let query = supabase.from('contacts').select('*');

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    if (filters?.tag) {
      query = query.contains('tags', [filters.tag]);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list contacts: ${error.message}`);
    return (data ?? []).map(toContact);
  }

  async count(filters?: ContactFilters): Promise<number> {
    let query = supabase.from('contacts').select('*', { count: 'exact', head: true });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { count, error } = await query;
    if (error) throw new Error(`Failed to count contacts: ${error.message}`);
    return count ?? 0;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete contact: ${error.message}`);
  }
}
