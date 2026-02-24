export type AgentStatus = 'online' | 'away' | 'offline';
export type LeadStatus = 'new' | 'attending' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type MessageSender = 'client' | 'agent' | 'bot' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'location' | 'contact';

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: AgentStatus;
  activeConversations: number;
  avgResponseTime: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  crmId?: string;
  tags: string[];
  leadStatus: LeadStatus;
  assignedAgent?: string;
  firstContactDate: string;
  lastMessageDate: string;
  travelHistory: TravelRecord[];
}

export interface TravelRecord {
  destination: string;
  date: string;
  status: 'completed' | 'ongoing' | 'cancelled';
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName?: string;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  type: MessageType;
  fileName?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  messages: Message[];
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  assignedAgentId?: string;
  isTyping?: boolean;
}

export interface InternalNote {
  id: string;
  contactId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface QuickReply {
  id: string;
  category: string;
  title: string;
  content: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  attending: 'Em atendimento',
  proposal: 'Proposta enviada',
  negotiation: 'Negociação',
  won: 'Fechado Ganho',
  lost: 'Fechado Perdido',
};
