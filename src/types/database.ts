// ============================================================
// Orange Messenger — Supabase Database Types
// ============================================================
// Generated from the database schema. Update when schema changes.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role: 'agent' | 'supervisor' | 'admin';
          status: 'online' | 'offline' | 'busy' | 'away';
          max_concurrent_chats: number;
          open_conversations_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          role?: 'agent' | 'supervisor' | 'admin';
          status?: 'online' | 'offline' | 'busy' | 'away';
          max_concurrent_chats?: number;
          open_conversations_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          role?: 'agent' | 'supervisor' | 'admin';
          status?: 'online' | 'offline' | 'busy' | 'away';
          max_concurrent_chats?: number;
          open_conversations_count?: number;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          avatar_url: string | null;
          zoho_crm_id: string | null;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          avatar_url?: string | null;
          zoho_crm_id?: string | null;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          avatar_url?: string | null;
          zoho_crm_id?: string | null;
          tags?: string[];
          metadata?: Json;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string;
          assigned_agent_id: string | null;
          channel: 'whatsapp' | 'web' | 'internal';
          status: 'open' | 'waiting' | 'closed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          subject: string | null;
          last_message_at: string | null;
          last_message_preview: string | null;
          unread_count: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          assigned_agent_id?: string | null;
          channel?: 'whatsapp' | 'web' | 'internal';
          status?: 'open' | 'waiting' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          subject?: string | null;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          unread_count?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          assigned_agent_id?: string | null;
          channel?: 'whatsapp' | 'web' | 'internal';
          status?: 'open' | 'waiting' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          subject?: string | null;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          unread_count?: number;
          metadata?: Json;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: 'customer' | 'agent' | 'system' | 'bot';
          sender_id: string | null;
          content: string;
          content_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'template' | 'interactive';
          media_url: string | null;
          wa_message_id: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: 'customer' | 'agent' | 'system' | 'bot';
          sender_id?: string | null;
          content: string;
          content_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'template' | 'interactive';
          media_url?: string | null;
          wa_message_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: 'customer' | 'agent' | 'system' | 'bot';
          sender_id?: string | null;
          content?: string;
          content_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'template' | 'interactive';
          media_url?: string | null;
          wa_message_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          metadata?: Json;
          updated_at?: string;
        };
      };
      quick_replies: {
        Row: {
          id: string;
          shortcut: string;
          title: string;
          content: string;
          category: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shortcut: string;
          title: string;
          content: string;
          category?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shortcut?: string;
          title?: string;
          content?: string;
          category?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      internal_notes: {
        Row: {
          id: string;
          contact_id: string;
          agent_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          agent_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          agent_id?: string;
          content?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
