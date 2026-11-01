import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/erp';
import { api } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username_or_email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('forgeflow_token');
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('forgeflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing token on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('forgeflow_token');
      if (storedToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
          localStorage.setItem('forgeflow_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username_or_email: string, password: string) => {
    const data = await api.login(username_or_email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('forgeflow_token', data.access_token);
    localStorage.setItem('forgeflow_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('forgeflow_token');
    localStorage.removeItem('forgeflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

