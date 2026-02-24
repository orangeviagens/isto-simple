// ============================================================
// Orange Messenger — Auth Context
// ============================================================
// Global authentication state. Wraps the app and provides
// login/logout/session to all components via useAuth() hook.
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthSession } from '@/interfaces/AuthService';
import type { Agent } from '@/types';
import container from '@/container';

interface AuthContextType {
  session: AuthSession | null;
  agent: Agent | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check existing session
  useEffect(() => {
    const init = async () => {
      try {
        const existingSession = await container.auth.getSession();
        setSession(existingSession);

        if (existingSession) {
          const agentProfile = await container.auth.getCurrentAgent();
          setAgent(agentProfile);
        }
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const unsubscribe = container.auth.onAuthStateChange(async (newSession) => {
      setSession(newSession);
      if (newSession) {
        const agentProfile = await container.auth.getCurrentAgent();
        setAgent(agentProfile);
      } else {
        setAgent(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const newSession = await container.auth.login(email, password);
    setSession(newSession);
    const agentProfile = await container.auth.getCurrentAgent();
    setAgent(agentProfile);
  };

  const logout = async () => {
    await container.auth.logout();
    setSession(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ session, agent, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
