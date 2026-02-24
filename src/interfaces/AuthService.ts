import type { Agent } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthStateCallback = (session: AuthSession | null) => void;

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number | string;
}

export interface AuthService {
  /** Sign in with email/password */
  login(email: string, password: string): Promise<AuthSession>;

  /** Sign out the current user */
  logout(): Promise<void>;

  /** Get current session (or null if not logged in) */
  getSession(): Promise<AuthSession | null>;

  /** Refresh the access token */
  refreshSession(): Promise<AuthSession>;

  /** Listen for auth state changes */
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;

  /** Get the current user's agent profile */
  getCurrentAgent(): Promise<Agent | null>;
}
