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

import type { CacheService, RealtimeService } from '@/interfaces';

// ── MVP Implementations ──────────────────────────────────────
import { MockCacheService } from '@/adapters/mock';
import { MockRealtimeService } from '@/adapters/mock';

// ── Enterprise Implementations (uncomment when ready) ────────
// import { RedisCache } from '@/adapters/redis/RedisCache';
// import { SocketIOAdapter } from '@/adapters/socketio/SocketIOAdapter';
// import { SupabaseAuthService } from '@/adapters/supabase/SupabaseAuthService';
// import { SupabaseStorageService } from '@/adapters/supabase/SupabaseStorageService';
// import { MetaWhatsAppService } from '@/adapters/whatsapp/MetaWhatsAppService';
// import { ZohoCRMService } from '@/adapters/zoho/ZohoCRMService';
// import { ClaudeAIService } from '@/adapters/ai/ClaudeAIService';

// ── Service Interfaces ───────────────────────────────────────
export interface Container {
  cache: CacheService;
  realtime: RealtimeService;
  // auth: AuthService;         // Phase 2
  // storage: StorageService;   // Phase 2
  // whatsapp: WhatsAppService; // Phase 2
  // crm: CRMService;           // Phase 3
  // ai: AIService;             // Phase 4
}

// ── Container Instance ───────────────────────────────────────
// Swap implementations here to migrate. Nothing else changes.
const container: Container = {
  cache: new MockCacheService(),
  realtime: new MockRealtimeService(),
  // auth: new SupabaseAuthService(config.supabase),
  // storage: new SupabaseStorageService(config.supabase),
  // whatsapp: new MetaWhatsAppService(config.whatsapp),
  // crm: new ZohoCRMService(config.zoho),
  // ai: new ClaudeAIService(config.ai),
};

export default container;
