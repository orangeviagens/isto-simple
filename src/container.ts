// ============================================================
// Orange Messenger — Dependency Injection Container
// ============================================================
// This is the SINGLE POINT OF CHANGE for swapping implementations.
//
// To migrate from MVP to Enterprise:
// 1. Import the new adapter (e.g., RedisCache instead of MockCacheService)
// 2. Replace the instantiation below
// 3. That's it — zero changes anywhere else in the codebase
// ============================================================

import type { CacheService, RealtimeService, AuthService } from '@/interfaces';
import type { ContactRepository } from '@/repositories/ContactRepository';
import type { ConversationRepository } from '@/repositories/ConversationRepository';
import type { MessageRepository } from '@/repositories/MessageRepository';

// ── MVP Implementations (Supabase + Mock cache) ─────────────
import { MockCacheService } from '@/adapters/mock';
import { SupabaseRealtimeService } from '@/adapters/supabase';
import { SupabaseAuthService } from '@/adapters/supabase';
import { SupabaseContactRepository } from '@/adapters/supabase';
import { SupabaseConversationRepository } from '@/adapters/supabase';
import { SupabaseMessageRepository } from '@/adapters/supabase';

// ── Enterprise Implementations (uncomment when ready) ────────
// import { RedisCache } from '@/adapters/redis/RedisCache';
// import { SocketIOAdapter } from '@/adapters/socketio/SocketIOAdapter';
// import { MetaWhatsAppService } from '@/adapters/whatsapp/MetaWhatsAppService';
// import { ZohoCRMService } from '@/adapters/zoho/ZohoCRMService';
// import { ClaudeAIService } from '@/adapters/ai/ClaudeAIService';

// ── Container Type ───────────────────────────────────────────
export interface Container {
  // Core services
  cache: CacheService;
  realtime: RealtimeService;
  auth: AuthService;

  // Repositories (data access)
  contactRepo: ContactRepository;
  conversationRepo: ConversationRepository;
  messageRepo: MessageRepository;

  // Future services (uncomment when ready)
  // whatsapp: WhatsAppService;  // Phase 2
  // crm: CRMService;            // Phase 3
  // ai: AIService;              // Phase 4
}

// ── Container Instance ───────────────────────────────────────
// Swap implementations here to migrate. Nothing else changes.
const container: Container = {
  cache: new MockCacheService(),                    // Still mock (no Redis needed for MVP)
  realtime: new SupabaseRealtimeService(),           // Real: Supabase Realtime
  auth: new SupabaseAuthService(),                   // Real: Supabase Auth
  contactRepo: new SupabaseContactRepository(),      // Real: Supabase PostgreSQL
  conversationRepo: new SupabaseConversationRepository(),
  messageRepo: new SupabaseMessageRepository(),
};

export default container;
