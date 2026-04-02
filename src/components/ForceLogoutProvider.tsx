import { useForceLogout } from '@/hooks/useForceLogout';

/**
 * Renders nothing — just activates the force-logout hook.
 */
export function ForceLogoutProvider() {
  useForceLogout();
  return null;
}
