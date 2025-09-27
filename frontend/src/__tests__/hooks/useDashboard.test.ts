import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDashboardData } from '@/hooks/useDashboard';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock the fixtures
jest.mock('@/fixtures/dashboard', () => ({
  dashboardFixtures: {
    shifts: [
      { id: '1', title: 'Morning Shift', time: '09:00 - 17:00' },
      { id: '2', title: 'Evening Shift', time: '17:00 - 01:00' },
    ],
    leaves: [],
    swaps: [],
  },
}));

import { fetchJson } from '@/lib/api';

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return mock data when mock is enabled', async () => {
    const { result } = renderHook(() => useDashboardData({ mock: true }));

    await waitFor(() => {
      expect(result.current.shifts).toHaveLength(2);
      expect(result.current.leaves).toHaveLength(0);
      expect(result.current.swaps).toHaveLength(0);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load real data from API when mock is disabled', async () => {
    const mockApiResponse = {
      shifts: [
        { id: '1', title: 'Day Shift', time: '08:00 - 16:00' },
      ],
      leaves: [
        { id: '1', date: '2024-01-15', reason: 'Personal leave' },
      ],
      swaps: [
        { id: '1', date: '2024-01-16', reason: 'Schedule conflict' },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.shifts).toEqual(mockApiResponse.shifts);
      expect(result.current.leaves).toEqual(mockApiResponse.leaves);
      expect(result.current.swaps).toEqual(mockApiResponse.swaps);
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/v1/dashboard');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
      expect(result.current.shifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
      expect(result.current.swaps).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle malformed API response', async () => {
    const malformedResponse = {
      // Missing expected fields
      someOtherField: 'value',
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(malformedResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.shifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
      expect(result.current.swaps).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle network errors', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.loading).toBe(false);
  });

  it('should refresh data when refresh is called', async () => {
    const mockApiResponse = {
      shifts: [{ id: '1', title: 'Updated Shift', time: '10:00 - 18:00' }],
      leaves: [],
      swaps: [],
    };

    (fetchJson as jest.Mock).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.shifts).toEqual(mockApiResponse.shifts);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('should handle partial API response', async () => {
    const partialResponse = {
      shifts: [{ id: '1', title: 'Shift 1', time: '09:00 - 17:00' }],
      // Missing leaves and swaps
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(partialResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.shifts).toEqual(partialResponse.shifts);
      expect(result.current.leaves).toEqual([]);
      expect(result.current.swaps).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty API response', async () => {
    const emptyResponse = {
      shifts: [],
      leaves: [],
      swaps: [],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.shifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
      expect(result.current.swaps).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
