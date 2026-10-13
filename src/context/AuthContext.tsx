import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';
import type { User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('edupulse-token'));
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.data) {
        setUser(response.data.data as User);
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('edupulse-token');
    }
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem('edupulse-token', token);
      void refreshUser();
    } else {
      localStorage.removeItem('edupulse-token');
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // no-op: logout always clears local state
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('edupulse-token');
  };

  const value = useMemo<AuthContextValue>(() => ({ user, token, login, logout, refreshUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
