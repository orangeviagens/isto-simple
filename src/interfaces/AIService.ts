import type { Message } from '@/types';

export interface AISuggestionRequest {
  conversationHistory: Message[];
  contactName: string;
  contactTags?: string[];
  agentName?: string;
  maxTokens?: number;
}

export interface AISuggestionResponse {
  suggestion: string;
  confidence: number;   // 0 to 1
  model: string;
}

export interface AIClassificationResult {
  intent: string;       // "viagem", "orcamento", "documentos", "reclamacao", etc.
  tags: string[];       // suggested tags
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
}

export interface AIService {
  /** Get a suggested reply based on conversation context */
  suggestReply(request: AISuggestionRequest): Promise<AISuggestionResponse>;

  /** Classify a message intent and suggest tags */
  classifyMessage(message: string, contactContext?: string): Promise<AIClassificationResult>;

  /** Generate a chatbot auto-reply (for after-hours) */
  generateAutoReply(
    message: string,
    conversationHistory: Message[],
    knowledgeBase?: string
  ): Promise<AISuggestionResponse>;

  /** Summarize a conversation */
  summarizeConversation(messages: Message[]): Promise<string>;
}
