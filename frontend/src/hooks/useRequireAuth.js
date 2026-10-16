import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for Intent-Driven Authentication Interception:
 * - Executes callback immediately if citizen is authenticated with required RBAC role.
 * - Otherwise intercepts the action, opens the contextual Auth Modal, and automatically
 *   resumes the requested action upon session creation.
 */
export function useRequireAuth() {
  const { user, requireAuth, openAuthModal, closeAuthModal, authModalOpen, authModalConfig } = useAuth();

  const withAuth = (actionCallback, options = {}) => {
    requireAuth(actionCallback, options);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    withAuth,
    openAuthModal,
    closeAuthModal,
    authModalOpen,
    authModalConfig,
  };
}

export default useRequireAuth;
