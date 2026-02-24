// ============================================================
// Orange Messenger — Repository Interfaces
// ============================================================
// Repositories abstract data access. The application code
// calls repository methods, never database queries directly.
// ============================================================

export type { ContactRepository, CreateContactDTO, UpdateContactDTO, ContactFilters } from './ContactRepository';
export type { ConversationRepository, CreateConversationDTO, UpdateConversationDTO, ConversationFilters, ConversationStatus } from './ConversationRepository';
export type { MessageRepository, CreateMessageDTO, UpdateMessageDTO, MessageFilters } from './MessageRepository';
export type { AgentRepository, CreateAgentDTO, UpdateAgentDTO } from './AgentRepository';
export type { QuickReplyRepository, CreateQuickReplyDTO } from './QuickReplyRepository';
export type { InternalNoteRepository, CreateNoteDTO } from './InternalNoteRepository';
