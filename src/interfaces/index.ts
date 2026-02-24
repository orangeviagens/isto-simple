// ============================================================
// Orange Messenger — Service Interfaces (Contracts)
// ============================================================
// Each interface defines a contract that can be implemented by
// different adapters (Supabase, Redis, AWS, etc.)
// The application code only depends on these interfaces, never
// on concrete implementations.
// ============================================================

export type { AuthService, AuthUser, AuthSession, LoginCredentials, AuthStateCallback } from './AuthService';
export type { RealtimeService, RealtimeEvent, RealtimePayload, RealtimeCallback } from './RealtimeService';
export type { CacheService } from './CacheService';
export type { MessageQueue, QueueMessage } from './MessageQueue';
export type { StorageService, UploadResult } from './StorageService';
export type { WhatsAppService, WhatsAppMessage, WhatsAppWebhookPayload, WhatsAppStatusPayload } from './WhatsAppService';
export type { CRMService, CRMLeadData, CRMLeadResult } from './CRMService';
export type { AIService, AISuggestionRequest, AISuggestionResponse, AIClassificationResult } from './AIService';
