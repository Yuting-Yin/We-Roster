import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { fetchJson } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return mock data when mock is enabled', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'mock-token',
    });

    const { result } = renderHook(() => useCurrentUser({ mock: true }));

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.displayName).toBeTruthy();
      expect(result.current.firstName).toBeTruthy();
      expect(result.current.initials).toBeTruthy();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load user data from API when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      designation: 'Nurse',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
    });

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.displayName).toBe('John Doe');
      expect(result.current.firstName).toBe('John');
      expect(result.current.initials).toBe('JD');
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/v1/auth/me', {
      signal: expect.any(AbortSignal),
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });
  });

  it('should handle API errors gracefully', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
    });

    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
      expect(result.current.user).toBeNull();
    });

    expect(result.current.loading).toBe(false);
  });

  it('should return error when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: null,
    });

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    expect(result.current.error).toBe('Not authenticated');
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should return error when no token is available', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: null,
    });

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    await waitFor(() => {
      expect(result.current.error).toBe('Not authenticated');
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle user data with missing fields', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      // Missing firstName, lastName, designation
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
    });

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.displayName).toBe('test');
      expect(result.current.firstName).toBe('test');
      expect(result.current.initials).toBe('TE');
      expect(result.current.designation).toBe('');
    });
  });

  it('should refresh user data when refresh is called', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
    });

    (fetchJson as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCurrentUser({ mock: false }));

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('should abort previous request when new request is made', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
    });

    (fetchJson as jest.Mock).mockResolvedValue(mockUser);

    const { result, rerender } = renderHook(
      ({ token }) => {
        (useAuth as jest.Mock).mockReturnValue({
          isAuthenticated: true,
          token,
        });
        return useCurrentUser({ mock: false });
      },
      { initialProps: { token: 'token1' } }
    );

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Change token to trigger new request
    rerender({ token: 'token2' });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledTimes(2);
    });
  });
});
