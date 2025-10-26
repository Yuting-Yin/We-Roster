import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch
global.fetch = jest.fn();

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <>
      <div testID="token">{auth?.token || 'null'}</div>
      <div testID="isAuthenticated">{auth?.isAuthenticated ? 'true' : 'false'}</div>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should provide initial state with no token', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent('null');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('should load token from AsyncStorage on mount', async () => {
    const mockToken = 'test-token-123';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent(mockToken);
      expect(getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
  });

  it('should handle login successfully', async () => {
    const mockResponse = {
      accessToken: 'new-token-456',
      user: { id: '1', email: 'test@example.com' },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    let authContext: any;
    const TestComponentWithLogin = () => {
      authContext = useAuth();
      return (
        <>
          <div testID="token">{authContext?.token || 'null'}</div>
          <div testID="isAuthenticated">{authContext?.isAuthenticated ? 'true' : 'false'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithLogin />
      </AuthProvider>
    );

    await act(async () => {
      await authContext.login('test', 'test@example.com', 'password');
    });

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent('new-token-456');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/api/v1/auth/login`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'test',
          email: 'test@example.com',
          password: 'password',
        }),
      })
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token-456');
  });

  it('should handle login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Invalid credentials'),
    });

    let authContext: any;
    const TestComponentWithLogin = () => {
      authContext = useAuth();
      return <div testID="token">{authContext?.token || 'null'}</div>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithLogin />
      </AuthProvider>
    );

    await act(async () => {
      await expect(authContext.login('test', 'test@example.com', 'wrongpassword')).rejects.toThrow(
        'Login failed: 401 - Invalid credentials'
      );
    });

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent('null');
    });

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('should handle logout', async () => {
    const mockToken = 'test-token-123';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

    let authContext: any;
    const TestComponentWithLogout = () => {
      authContext = useAuth();
      return (
        <>
          <div testID="token">{authContext?.token || 'null'}</div>
          <div testID="isAuthenticated">{authContext?.isAuthenticated ? 'true' : 'false'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponentWithLogout />
      </AuthProvider>
    );

    // Wait for token to load
    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent(mockToken);
    });

    // Logout
    await act(async () => {
      await authContext.logout();
    });

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent('null');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should handle network errors during login', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    let authContext: any;
    const TestComponentWithLogin = () => {
      authContext = useAuth();
      return <div testID="token">{authContext?.token || 'null'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponentWithLogin />
      </AuthProvider>
    );

    await act(async () => {
      await expect(authContext.login('test', 'test@example.com', 'password')).rejects.toThrow('Network error');
    });

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('token')).toHaveTextContent('null');
      expect(getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });
});
