// ============================================================================
//  CENTINELA — Auth Context
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { SafeUser, Permission } from '@/types';
import { ROLE_PERMISSIONS } from '@/config/constants';
import * as authService from '@/services/auth.service';
import * as dbService from '@/services/database.service';
import { useAlert } from './AlertContext';

interface AuthContextValue {
  currentUser: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  // Inicializar: abrir DB, crear admin si no existe, restaurar sesión
  useEffect(() => {
    async function initialize() {
      try {
        await dbService.db.open();
        await dbService.ensureAdminUser();
        const user = await authService.restoreSession();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error crítico durante inicialización:', error);
        showAlert('error', 'Error crítico al inicializar la base de datos.');
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const user = await authService.login(username, password);
        setCurrentUser(user);
        showAlert('success', `¡Bienvenido, ${user.displayName}!`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error de autenticación.';
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!currentUser) return false;
      const userPermissions = ROLE_PERMISSIONS[currentUser.role] || [];
      return userPermissions.includes(permission);
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
