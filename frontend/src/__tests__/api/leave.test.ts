import { createLeaveRequest, CreateLeaveRequestInput } from '@/api/leave';
import { fetchJson } from '@/lib/api';

// Mock the fetchJson function
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
  API_BASE: 'http://localhost:8080',
}));

describe('Leave API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchJson as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createLeaveRequest', () => {
    const mockLeaveRequest: CreateLeaveRequestInput = {
      allDay: true,
      date: '2024-01-15',
      reason: 'Personal leave',
      createdBy: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      createdAt: '2024-01-10T10:00:00',
    };

    it('should create leave request successfully', async () => {
      const mockResponse = { id: '123' };
      (fetchJson as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createLeaveRequest(mockLeaveRequest);

      expect(fetchJson).toHaveBeenCalledWith('/api/v1/leaves', {
        method: 'POST',
        body: mockLeaveRequest,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create shift leave request successfully', async () => {
      const shiftLeaveRequest: CreateLeaveRequestInput = {
        ...mockLeaveRequest,
        allDay: false,
        start: '09:00',
        end: '17:00',
        shiftId: '1',
      };

      const mockResponse = { id: '124' };
      (fetchJson as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createLeaveRequest(shiftLeaveRequest);

      expect(fetchJson).toHaveBeenCalledWith('/api/v1/leaves', {
        method: 'POST',
        body: shiftLeaveRequest,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle duplicate leave request error', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'A leave request for this day already exists',
        duplicate: true,
      };

      (fetchJson as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      const result = await createLeaveRequest(mockLeaveRequest);

      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle validation errors', async () => {
      const error = new Error('HTTP 400: Invalid date format');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createLeaveRequest(mockLeaveRequest)).rejects.toThrow('HTTP 400: Invalid date format');
    });

    it('should handle server errors', async () => {
      const error = new Error('HTTP 500: Database connection failed');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createLeaveRequest(mockLeaveRequest)).rejects.toThrow('HTTP 500: Database connection failed');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createLeaveRequest(mockLeaveRequest)).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response', async () => {
      const error = new Error('Invalid JSON');
      (fetchJson as jest.Mock).mockRejectedValueOnce(error);

      await expect(createLeaveRequest(mockLeaveRequest)).rejects.toThrow('Invalid JSON');
    });
  });
});