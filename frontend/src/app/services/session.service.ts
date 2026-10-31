import { Injectable, signal } from '@angular/core';

export type PortalRole = 'student' | 'college' | 'admin';

export interface PortalSession {
  role: PortalRole;
  email: string;
  name?: string;
  token?: string;
  collegeId?: string;
  collegeName?: string;
  viaGoogle?: boolean;
}

/**
 * Role-based portal session store.
 * After signing in, a user is isolated to their own portal:
 *   student  -> /student   |   college -> /college   |   admin -> /aicte
 * Without a session all public portals remain browsable (demo mode).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly STORAGE_KEY = 'apaar_session';

  readonly session = signal<PortalSession | null>(this.restore());

  signIn(session: PortalSession) {
    this.session.set(session);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch { /* storage unavailable */ }
  }

  signOut() {
    this.session.set(null);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }

  get role(): PortalRole | null {
    return this.session()?.role ?? null;
  }

  get token(): string | undefined {
    return this.session()?.token;
  }

  get homeRoute(): string {
    switch (this.role) {
      case 'student': return '/student';
      case 'college': return '/college';
      case 'admin': return '/aicte';
      default: return '/';
    }
  }

  canAccess(route: string): boolean {
    const s = this.session();
    if (!s) return true; // public browsing before sign-in
    switch (route) {
      case '/student': return s.role === 'student';
      case '/college': return s.role === 'college';
      case '/aicte': return s.role === 'admin';
      default: return true;
    }
  }

  private restore(): PortalSession | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) as PortalSession : null;
    } catch {
      return null;
    }
  }
}
