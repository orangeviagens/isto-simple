// ============================================================
// Orange Messenger — Environment Configuration
// ============================================================
// All external URLs, keys, and secrets are centralized here.
// NEVER hardcode credentials anywhere else in the codebase.
// ============================================================

export interface AppConfig {
  // App
  app: {
    name: string;
    url: string;
    env: 'development' | 'staging' | 'production';
  };

  // Supabase
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };

  // WhatsApp Cloud API
  whatsapp: {
    apiUrl: string;
    phoneNumberId: string;
    accessToken: string;
    verifyToken: string;
    appSecret: string;
  };

  // Zoho CRM
  zoho: {
    apiUrl: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };

  // Claude AI
  ai: {
    apiUrl: string;
    apiKey: string;
    model: string;
    maxTokens: number;
  };
}

function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback;
  if (value === undefined) {
    console.warn(`[Config] Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const config: AppConfig = {
  app: {
    name: 'Orange Messenger',
    url: getEnvVar('VITE_APP_URL', 'http://localhost:8080'),
    env: (getEnvVar('VITE_APP_ENV', 'development') as AppConfig['app']['env']),
  },

  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', ''),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
    serviceRoleKey: getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  },

  whatsapp: {
    apiUrl: getEnvVar('VITE_WHATSAPP_API_URL', 'https://graph.facebook.com/v21.0'),
    phoneNumberId: getEnvVar('VITE_WHATSAPP_PHONE_NUMBER_ID', ''),
    accessToken: getEnvVar('VITE_WHATSAPP_ACCESS_TOKEN', ''),
    verifyToken: getEnvVar('VITE_WHATSAPP_VERIFY_TOKEN', ''),
    appSecret: getEnvVar('VITE_WHATSAPP_APP_SECRET', ''),
  },

  zoho: {
    apiUrl: getEnvVar('VITE_ZOHO_API_URL', 'https://www.zohoapis.com/crm/v8'),
    clientId: getEnvVar('VITE_ZOHO_CLIENT_ID', ''),
    clientSecret: getEnvVar('VITE_ZOHO_CLIENT_SECRET', ''),
    refreshToken: getEnvVar('VITE_ZOHO_REFRESH_TOKEN', ''),
  },

  ai: {
    apiUrl: getEnvVar('VITE_AI_API_URL', 'https://api.anthropic.com/v1'),
    apiKey: getEnvVar('VITE_AI_API_KEY', ''),
    model: getEnvVar('VITE_AI_MODEL', 'claude-haiku-4-5-20251001'),
    maxTokens: parseInt(getEnvVar('VITE_AI_MAX_TOKENS', '1024'), 10),
  },
};
