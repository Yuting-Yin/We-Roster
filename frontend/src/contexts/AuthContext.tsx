import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, setAuthTokenGetter, fetchJson } from '../lib/api';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (domain: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    // Load token from storage on app start
    loadToken();
  }, []);

  useEffect(() => {
    // Set up auth token getter for API calls - this will always get the current token
    console.log('🔍 AuthContext - Setting auth token getter, current token:', token ? 'Token present' : 'No token');
    setAuthTokenGetter(() => {
      // Get the current token value from state
      console.log('🔍 AuthContext - AuthTokenGetter called, returning:', token ? 'Token present' : 'No token');
      return token;
    });
  }, [token]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setTokenState(storedToken);
        console.log('🔍 AuthContext - Token loaded from storage');
      }
    } catch (error) {
      console.error('🔍 AuthContext - Failed to load token:', error);
    }
  };

  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('auth_token', newToken);
        console.log('🔍 AuthContext - Token saved');
      } else {
        await AsyncStorage.removeItem('auth_token');
        console.log('🔍 AuthContext - Token cleared');
      }
      setTokenState(newToken);
    } catch (error) {
      console.error('🔍 AuthContext - Failed to save token:', error);
    }
  };

  const login = async (domain: string, email: string, password: string) => {
    try {
      console.log('🔍 AuthContext - Login attempt:', { domain, email, password: '***' });
      console.log('🔍 AuthContext - API_BASE:', API_BASE);
      
      // Try with direct fetch first for debugging
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ domain, email, password }),
      });

      console.log('🔍 AuthContext - Response status:', response.status);
      console.log('🔍 AuthContext - Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 AuthContext - Login failed:', response.status, errorText);
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 AuthContext - Login successful, data:', data);
      await setToken(data.accessToken);
    } catch (error) {
      console.error('🔍 AuthContext - Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔍 AuthContext - Logout');
    await setToken(null);
  };

  const value: AuthContextType = {
    token,
    setToken,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
