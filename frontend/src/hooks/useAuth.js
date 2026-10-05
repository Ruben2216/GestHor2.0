/**
 * ============================================================================
 * GestHor 2.0 - Hook useAuth
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
