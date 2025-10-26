import { fetchJson, ApiError, API_BASE } from '@/lib/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchJson', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchJson('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/test`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make successful POST request', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { id: '123' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchJson('/api/test', {
        method: 'POST',
        body: mockData,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include authorization header when token is available', async () => {
      // Mock AsyncStorage to return a token
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('test-token');

      const mockResponse = { data: 'protected' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchJson('/api/protected');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/protected`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw ApiError for non-ok responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      });

      try {
        await fetchJson('/api/notfound');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Resource not found');
      }
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      await expect(fetchJson('/api/slow')).rejects.toThrow();
    }, 5000);

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchJson('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(fetchJson('/api/test')).rejects.toThrow('Invalid JSON');
    });
  });
});
