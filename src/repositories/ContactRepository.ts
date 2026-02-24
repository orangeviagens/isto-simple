import type { Contact, LeadStatus } from '@/types';

export interface CreateContactDTO {
  phone: string;
  name: string;
  email?: string;
  crmId?: string;
  omnichatId?: string;
  tags?: string[];
  leadStatus?: LeadStatus;
  assignedAgent?: string;
}

export interface UpdateContactDTO {
  name?: string;
  email?: string;
  crmId?: string;
  tags?: string[];
  leadStatus?: LeadStatus;
  assignedAgent?: string;
}

export interface ContactFilters {
  assignedAgent?: string;
  leadStatus?: LeadStatus;
  tag?: string;
  search?: string;  // search by name or phone
}

export interface ContactRepository {
  findById(id: string): Promise<Contact | null>;
  findByPhone(phone: string): Promise<Contact | null>;
  findByCrmId(crmId: string): Promise<Contact | null>;
  create(data: CreateContactDTO): Promise<Contact>;
  update(id: string, data: UpdateContactDTO): Promise<Contact>;
  list(filters?: ContactFilters, limit?: number, offset?: number): Promise<Contact[]>;
  count(filters?: ContactFilters): Promise<number>;
  delete(id: string): Promise<void>;
}
