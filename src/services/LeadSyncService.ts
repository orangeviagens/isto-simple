import type { Contact } from '@/types';
import type { ContactRepository, CreateContactDTO } from '@/repositories';
import type { ConversationRepository } from '@/repositories';
import type { CRMService } from '@/interfaces';

/**
 * LeadSyncService — Synchronizes contacts between the messenger and Zoho CRM.
 *
 * When a new WhatsApp message arrives from an unknown number:
 * 1. Creates a Contact in the local database
 * 2. Searches Zoho CRM for an existing Lead (by phone)
 * 3. If found, links the crmId; if not, creates a new Lead
 * 4. Creates a new Conversation for the contact
 */
export class LeadSyncService {
  constructor(
    private contacts: ContactRepository,
    private conversations: ConversationRepository,
    private crm: CRMService,
  ) {}

  /** Process a new incoming contact from WhatsApp */
  async syncNewContact(phone: string, name?: string): Promise<Contact> {
    // 1. Check if contact already exists locally
    const existing = await this.contacts.findByPhone(phone);
    if (existing) return existing;

    // 2. Check if Lead exists in Zoho CRM
    const crmLead = await this.crm.findLeadByPhone(phone);

    // 3. Create local contact
    const contactData: CreateContactDTO = {
      phone,
      name: name || crmLead?.name || phone,
      email: crmLead?.email,
      crmId: crmLead?.id,
      omnichatId: crmLead?.omnichatId,
      leadStatus: crmLead?.leadStatus || 'new',
      tags: [],
    };

    const contact = await this.contacts.create(contactData);

    // 4. If no CRM Lead exists, create one
    if (!crmLead) {
      const newLead = await this.crm.createLead({
        phone,
        name: name || phone,
        source: 'WhatsApp - Orange Messenger',
      });

      // Update local contact with CRM ID
      await this.contacts.update(contact.id, { crmId: newLead.id });
      contact.crmId = newLead.id;
    }

    // 5. Create a new conversation for this contact
    await this.conversations.create({
      contactId: contact.id,
      channel: 'whatsapp',
      status: 'open',
    });

    return contact;
  }

  /** Sync local contact data back to Zoho CRM */
  async pushToZoho(contactId: string): Promise<void> {
    const contact = await this.contacts.findById(contactId);
    if (!contact || !contact.crmId) return;

    await this.crm.updateLead(contact.crmId, {
      name: contact.name,
      email: contact.email,
      tags: contact.tags,
      leadStatus: contact.leadStatus,
    });
  }

  /** Pull latest data from Zoho CRM and update local contact */
  async pullFromZoho(contactId: string): Promise<Contact | null> {
    const contact = await this.contacts.findById(contactId);
    if (!contact || !contact.crmId) return null;

    const crmLead = await this.crm.getLeadById(contact.crmId);
    if (!crmLead) return contact;

    const updated = await this.contacts.update(contactId, {
      name: crmLead.name,
      email: crmLead.email,
      leadStatus: crmLead.leadStatus,
    });

    return updated;
  }
}
