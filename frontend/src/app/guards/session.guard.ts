import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Portal isolation guard.
 * - No session  -> allow (public demo browsing).
 * - Session role matches the portal -> allow.
 * - Otherwise -> redirect the user to their own portal (isolation).
 */
export function portalGuard(allowedRole: 'student' | 'college' | 'admin'): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    const current = session.session();
    if (!current) return true;                       // not signed in: public view
    if (current.role === allowedRole) return true;   // correct portal
    return router.createUrlTree([session.homeRoute]); // isolate to own portal
  };
}
