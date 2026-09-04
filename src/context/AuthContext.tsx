import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { signOut } from '@/api/auth';
import { refreshAccessToken } from '@/api/client';
import { getAccessToken, setAccessToken, subscribeAccessToken } from '@/api/tokenStore';

interface AuthContextValue {
  isAuthenticated: boolean;
  /** 앱 부팅 시 silent refresh가 끝날 때까지 true */
  isBootstrapping: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => subscribeAccessToken(setToken), []);

  useEffect(() => {
    refreshAccessToken().finally(() => setIsBootstrapping(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    } finally {
      setAccessToken(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value: AuthContextValue = {
    isAuthenticated: token !== null,
    isBootstrapping,
    setAccessToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
