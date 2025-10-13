import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDashboardData } from '@/hooks/useDashboard';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock the fixtures
jest.mock('@/fixtures/dashboard', () => ({
  dashboardFixtures: {
    duty: [
      { id: 'd1', initials: 'TV', name: 'Thu Vo', role: 'Anaes Coordinator', theatre: 'Theatre 1', site: 'PMCC', time: '08:00 - 13:00', date: 'Tue. 12 May' },
      { id: 'd2', initials: 'MJ', name: 'Min Ji', role: 'Anaes Coordinator', theatre: '—', site: 'PMCC', time: '—', date: 'Tue. 12 May', urgent: true },
    ],
    myShifts: [
      { id: 's1', date: 'Wed, 14 May', time: '13:00 - 18:00', site: 'PMCC', dept: 'Anaes Coordinator', teammates: 'Working with 3 others' },
      { id: 's2', date: 'Thu, 15 May', time: '08:00 - 12:00', site: 'PMCC', dept: 'Anaes Coordinator', teammates: 'Working with 3 others' },
    ],
    openShifts: [
      { id: 'o1', date: 'Fri, 16 May', time: '08:00 - 12:00', site: 'PMCC', dept: 'Neurosurgery', bonus: '+$500', urgent: true },
    ],
    leaves: [],
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
      expect(result.current.duty).toHaveLength(2);
      expect(result.current.myShifts).toHaveLength(2);
      expect(result.current.openShifts).toHaveLength(1);
      expect(result.current.leaves).toHaveLength(0);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load real data from API when mock is disabled', async () => {
    const mockApiResponse = {
      duty: [
        { id: 'd1', initials: 'AA', name: 'Alex A', role: 'Coordinator', theatre: 'Theatre 1', site: 'PMCC', time: '08:00 - 13:00', date: 'Wed, 15 May' },
      ],
      myShifts: [
        { id: 's1', date: 'Wed, 15 May', time: '08:00 - 16:00', site: 'PMCC', dept: 'Anaes', teammates: 'Working with 2 others' },
      ],
      openShifts: [
        { id: 'o1', date: 'Thu, 16 May', time: '08:00 - 16:00', site: 'PMCC', dept: 'Anaes', bonus: '+$300' },
      ],
      leaves: [
        { id: 'l1', date: '2024-01-15', reason: 'Personal leave' },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.duty).toEqual(mockApiResponse.duty);
      expect(result.current.myShifts).toEqual(mockApiResponse.myShifts);
      expect(result.current.openShifts).toEqual(mockApiResponse.openShifts);
      expect(result.current.leaves).toEqual(mockApiResponse.leaves);
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
      expect(result.current.duty).toEqual([]);
      expect(result.current.myShifts).toEqual([]);
      expect(result.current.openShifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
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
      expect(result.current.duty).toEqual([]);
      expect(result.current.myShifts).toEqual([]);
      expect(result.current.openShifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
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
      duty: [{ id: 'd1', initials: 'BB', name: 'Bella', role: 'Coordinator', theatre: 'Theatre 3', site: 'PMCC', time: '09:00 - 13:00', date: 'Fri, 17 May' }],
      myShifts: [{ id: 's1', date: 'Fri, 17 May', time: '10:00 - 18:00', site: 'PMCC', dept: 'Anaes', teammates: 'Working with 4 others' }],
      openShifts: [],
      leaves: [],
    };

    (fetchJson as jest.Mock).mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.myShifts).toEqual(mockApiResponse.myShifts);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('should handle partial API response', async () => {
    const partialResponse = {
      duty: [{ id: 'd1', initials: 'CD', name: 'Chris', role: 'Coordinator', theatre: 'Theatre 4', site: 'PMCC', time: '09:00 - 17:00', date: 'Mon, 20 May' }],
      myShifts: [{ id: 's1', date: 'Mon, 20 May', time: '09:00 - 17:00', site: 'PMCC', dept: 'Anaes', teammates: 'Working with 1 other' }],
      // Missing openShifts and leaves
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(partialResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.duty).toEqual(partialResponse.duty);
      expect(result.current.myShifts).toEqual(partialResponse.myShifts);
      expect(result.current.openShifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty API response', async () => {
    const emptyResponse = {
      duty: [],
      myShifts: [],
      openShifts: [],
      leaves: [],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(emptyResponse);

    const { result } = renderHook(() => useDashboardData({ mock: false }));

    await waitFor(() => {
      expect(result.current.duty).toEqual([]);
      expect(result.current.myShifts).toEqual([]);
      expect(result.current.openShifts).toEqual([]);
      expect(result.current.leaves).toEqual([]);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
