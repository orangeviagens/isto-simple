// ============================================================
// Orange Messenger — Supabase Auth Service
// ============================================================

import { supabase } from '@/lib/supabase';
import type { AuthService, AuthSession, AuthStateCallback } from '@/interfaces/AuthService';
import type { Agent } from '@/types';

export class SupabaseAuthService implements AuthService {
  async login(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`Login failed: ${error.message}`);

    return {
      accessToken: data.session?.access_token ?? '',
      refreshToken: data.session?.refresh_token ?? '',
      expiresAt: data.session?.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : '',
      user: {
        id: data.user?.id ?? '',
        email: data.user?.email ?? '',
        name: data.user?.user_metadata?.name ?? data.user?.email ?? '',
        role: (data.user?.user_metadata?.role as 'agent' | 'supervisor' | 'admin') ?? 'agent',
      },
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Logout failed: ${error.message}`);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) return null;

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : '',
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.user_metadata?.name ?? session.user.email ?? '',
        role: (session.user.user_metadata?.role as 'agent' | 'supervisor' | 'admin') ?? 'agent',
      },
    };
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) throw new Error(`Refresh failed: ${error?.message}`);

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : '',
      user: {
        id: data.session.user.id,
        email: data.session.user.email ?? '',
        name: data.session.user.user_metadata?.name ?? data.session.user.email ?? '',
        role: (data.session.user.user_metadata?.role as 'agent' | 'supervisor' | 'admin') ?? 'agent',
      },
    };
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          callback({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : '',
            user: {
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.name ?? session.user.email ?? '',
              role: (session.user.user_metadata?.role as 'agent' | 'supervisor' | 'admin') ?? 'agent',
            },
          });
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }

  async getCurrentAgent(): Promise<Agent | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Try to find the agent in the agents table
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('email', user.email ?? '')
      .single();

    if (agent) {
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        avatar: agent.avatar_url ?? undefined,
        status: agent.status as Agent['status'],
        activeConversations: agent.open_conversations_count,
        avgResponseTime: '0m',
      };
    }

    // Fallback: return from auth metadata
    return {
      id: user.id,
      name: user.user_metadata?.name ?? user.email ?? '',
      email: user.email ?? '',
      status: 'online',
      activeConversations: 0,
      avgResponseTime: '0m',
    };
  }
}
