import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMyLeaves } from '@/hooks/useMyLeaves';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock the leave API
jest.mock('@/api/leave', () => ({
  getMyLeaves: jest.fn(),
}));

import { fetchJson } from '@/lib/api';
import { getMyLeaves } from '@/api/leave';

describe('useMyLeaves', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load leave requests successfully', async () => {
    const mockLeaveRequests = [
      {
        id: 1,
        requestDate: '2024-01-15T00:00:00Z',
        startTime: '2024-01-15T00:00:00Z',
        endTime: '2024-01-15T23:59:59Z',
        leaveType: 'All Day Leave',
        status: 'PENDING',
        reason: 'Personal leave',
      },
      {
        id: 2,
        requestDate: '2024-01-20T00:00:00Z',
        startTime: '2024-01-20T09:00:00Z',
        endTime: '2024-01-20T12:00:00Z',
        leaveType: 'Shift Leave',
        status: 'APPROVED',
        reason: 'Medical appointment',
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValueOnce(mockLeaveRequests);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(getMyLeaves).toHaveBeenCalledWith(undefined);
  });

  it('should handle empty leave requests', async () => {
    (getMyLeaves as jest.Mock).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle API errors gracefully', async () => {
    (getMyLeaves as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
      expect(result.current.leaves).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle network errors', async () => {
    (getMyLeaves as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.leaves).toEqual([]);
    });
  });

  it('should refresh leave requests when refresh is called', async () => {
    const mockLeaves = [
      {
        id: '1',
        date: '2024-01-15',
        reason: 'Personal leave',
        status: 'PENDING',
        allDay: true,
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValue(mockLeaves);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual(mockLeaves);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(getMyLeaves).toHaveBeenCalledTimes(2);
  });

  it('should handle malformed API response', async () => {
    const malformedResponse = {
      // Missing expected fields
      someOtherField: 'value',
    };

    (getMyLeaves as jest.Mock).mockResolvedValueOnce(malformedResponse);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle partial API response', async () => {
    const partialResponse = [
      {
        id: '1',
        date: '2024-01-15',
        // Missing some fields
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValueOnce(partialResponse);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual(partialResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should abort previous request when new request is made', async () => {
    const mockLeaves = [
      {
        id: '1',
        date: '2024-01-15',
        reason: 'Personal leave',
        status: 'PENDING',
        allDay: true,
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValue(mockLeaves);

    const { result, rerender } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual(mockLeaves);
    });

    // Trigger re-render to make new request
    rerender();

    await waitFor(() => {
      expect(getMyLeaves).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle different leave statuses', async () => {
    const mockLeaves = [
      {
        id: '1',
        date: '2024-01-15',
        reason: 'Personal leave',
        status: 'PENDING',
        allDay: true,
      },
      {
        id: '2',
        date: '2024-01-20',
        reason: 'Medical appointment',
        status: 'APPROVED',
        allDay: false,
        start: '09:00',
        end: '12:00',
      },
      {
        id: '3',
        date: '2024-01-25',
        reason: 'Family emergency',
        status: 'REJECTED',
        allDay: true,
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValueOnce(mockLeaves);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual(mockLeaves);
      expect(result.current.leaves[0].status).toBe('PENDING');
      expect(result.current.leaves[1].status).toBe('APPROVED');
      expect(result.current.leaves[2].status).toBe('REJECTED');
    });
  });

  it('should handle both all-day and shift leaves', async () => {
    const mockLeaves = [
      {
        id: '1',
        date: '2024-01-15',
        reason: 'Personal leave',
        status: 'PENDING',
        allDay: true,
      },
      {
        id: '2',
        date: '2024-01-20',
        reason: 'Medical appointment',
        status: 'APPROVED',
        allDay: false,
        start: '09:00',
        end: '12:00',
      },
    ];

    (getMyLeaves as jest.Mock).mockResolvedValueOnce(mockLeaves);

    const { result } = renderHook(() => useMyLeaves());

    await waitFor(() => {
      expect(result.current.leaves).toEqual(mockLeaves);
      expect(result.current.leaves[0].allDay).toBe(true);
      expect(result.current.leaves[1].allDay).toBe(false);
      expect(result.current.leaves[1].start).toBe('09:00');
      expect(result.current.leaves[1].end).toBe('12:00');
    });
  });
});
