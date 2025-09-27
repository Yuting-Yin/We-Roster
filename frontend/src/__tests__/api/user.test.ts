import { getAvailableUsers } from '@/api/user';

// Mock the fetch function
global.fetch = jest.fn();

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAvailableUsers', () => {
    it('should fetch available users successfully', async () => {
      const mockUsers = [
        {
          id: '1',
          displayName: 'John Doe',
          title: 'Nurse',
        },
        {
          id: '2',
          displayName: 'Jane Smith',
          title: 'Doctor',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const result = await getAvailableUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.0.173:8080/api/v1/users/available',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockUsers);
    });

    it('should handle server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(getAvailableUsers()).rejects.toThrow('HTTP 500: Server error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getAvailableUsers()).rejects.toThrow('Network error');
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await getAvailableUsers();

      expect(result).toEqual([]);
    });
  });
});