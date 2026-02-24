import type { Contact, LeadStatus } from '@/types';

export interface CRMLeadData {
  phone: string;
  name: string;
  email?: string;
  source?: string;
  omnichatId?: string;
  tags?: string[];
}

export interface CRMLeadResult {
  id: string;
  phone: string;
  name: string;
  email?: string;
  leadStatus: LeadStatus;
  omnichatId?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CRMService {
  /** Create a new Lead in the CRM */
  createLead(data: CRMLeadData): Promise<CRMLeadResult>;

  /** Search for a Lead by phone number */
  findLeadByPhone(phone: string): Promise<CRMLeadResult | null>;

  /** Get Lead details by CRM ID */
  getLeadById(id: string): Promise<CRMLeadResult | null>;

  /** Update an existing Lead */
  updateLead(id: string, data: Partial<CRMLeadData> & { leadStatus?: LeadStatus }): Promise<CRMLeadResult>;

  /** Sync a contact's data with the CRM (upsert) */
  syncContact(contact: Contact): Promise<CRMLeadResult>;
}
