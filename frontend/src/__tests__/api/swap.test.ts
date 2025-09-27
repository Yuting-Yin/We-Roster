import { createSwapRequest, CreateSwapRequestInput } from '@/api/swap';
import { fetchJson } from '@/lib/api';

// Mock the fetchJson function
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
  API_BASE: 'http://localhost:8080',
}));

describe('Swap API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchJson as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createSwapRequest', () => {
    const mockSwapRequest: CreateSwapRequestInput = {
      requesterId: '1',
      targetUserId: '2',
      date: '2024-01-15',
      shiftId: 'shift-123',
      reason: 'Personal appointment',
    };

    it('should create swap request successfully', async () => {
      const mockResponse = { id: 'swap-123' };
      (fetchJson as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createSwapRequest(mockSwapRequest);

      expect(fetchJson).toHaveBeenCalledWith('/api/v1/swaps', {
        method: 'POST',
        body: mockSwapRequest,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const error = new Error('HTTP 400: Requester ID is required');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createSwapRequest(mockSwapRequest)).rejects.toThrow('HTTP 400: Requester ID is required');
    });

    it('should handle duplicate swap request error', async () => {
      const error = new Error('HTTP 409: Swap request already exists');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createSwapRequest(mockSwapRequest)).rejects.toThrow('HTTP 409: Swap request already exists');
    });

    it('should handle server errors', async () => {
      const error = new Error('HTTP 500: Database connection failed');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createSwapRequest(mockSwapRequest)).rejects.toThrow('HTTP 500: Database connection failed');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createSwapRequest(mockSwapRequest)).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response', async () => {
      const error = new Error('Invalid JSON');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createSwapRequest(mockSwapRequest)).rejects.toThrow('Invalid JSON');
    });

    it('should create swap request with different data', async () => {
      const differentSwapRequest: CreateSwapRequestInput = {
        requesterId: '3',
        targetUserId: '4',
        date: '2024-01-20',
        shiftId: 'shift-456',
        reason: 'Family emergency',
      };

      const mockResponse = { id: 'swap-456' };
      (fetchJson as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createSwapRequest(differentSwapRequest);

      expect(fetchJson).toHaveBeenCalledWith('/api/v1/swaps', {
        method: 'POST',
        body: differentSwapRequest,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});