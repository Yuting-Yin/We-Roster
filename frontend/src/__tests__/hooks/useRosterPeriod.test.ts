import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRosterPeriod } from '@/hooks/useRosterPeriod';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock the date utilities
jest.mock('@/lib/date', () => ({
  dayKey: jest.fn((date) => '2024-01-15'),
}));

import { fetchJson } from '@/lib/api';

describe('useRosterPeriod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load roster period data successfully', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: '2024-01-15',
              events: [
                {
                  id: '1',
                  title: 'Morning Shift',
                  start: '09:00',
                  end: '17:00',
                  type: 'shift',
                },
              ],
            },
          ],
        },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterPeriod);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/v1/roster/period?date=2024-01-15');
  });

  it('should handle empty roster period data', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterPeriod);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(result.current.rosterPeriod).toEqual(mockRosterPeriod);
  });

  it('should handle API errors gracefully', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle network errors', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should refresh roster period data when refresh is called', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: '2024-01-15',
              events: [
                {
                  id: '1',
                  title: 'Morning Shift',
                  start: '09:00',
                  end: '17:00',
                  type: 'shift',
                },
              ],
            },
          ],
        },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterPeriod);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('should handle malformed API response', async () => {
    const malformedResponse = {
      // Missing expected fields
      someOtherField: 'value',
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(malformedResponse);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(result.current.rosterPeriod).toEqual(malformedResponse);
  });

  it('should handle different event types in roster period', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: '2024-01-15',
              events: [
                {
                  id: '1',
                  title: 'Morning Shift',
                  start: '09:00',
                  end: '17:00',
                  type: 'shift',
                },
                {
                  id: '2',
                  title: 'Personal Leave',
                  start: '00:00',
                  end: '23:59',
                  type: 'leave',
                },
                {
                  id: '3',
                  title: 'Swap Request',
                  start: '14:00',
                  end: '22:00',
                  type: 'swap',
                },
              ],
            },
          ],
        },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterPeriod);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const events = result.current.rosterPeriod.weeks[0].days[0].events;
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('shift');
    expect(events[1].type).toBe('leave');
    expect(events[2].type).toBe('swap');
  });

  it('should handle different dates', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [],
    };

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterPeriod);

    const { result, rerender } = renderHook(
      ({ date }) => useRosterPeriod(date),
      { initialProps: { date: new Date('2024-01-15') } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change date
    rerender({ date: new Date('2024-01-16') });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledTimes(2);
    });
  });

  it('should abort previous request when new request is made', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [],
    };

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterPeriod);

    const { result, rerender } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Trigger re-render to make new request
    rerender();

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle partial API response', async () => {
    const partialResponse = {
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: '2024-01-15',
              events: [
                {
                  id: '1',
                  title: 'Morning Shift',
                  // Missing some fields
                },
              ],
            },
          ],
        },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(partialResponse);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(result.current.rosterPeriod).toEqual(partialResponse);
  });

  it('should handle multiple weeks in roster period', async () => {
    const mockRosterPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              date: '2024-01-15',
              events: [
                {
                  id: '1',
                  title: 'Morning Shift',
                  start: '09:00',
                  end: '17:00',
                  type: 'shift',
                },
              ],
            },
          ],
        },
        {
          weekNumber: 2,
          days: [
            {
              date: '2024-01-22',
              events: [
                {
                  id: '2',
                  title: 'Evening Shift',
                  start: '17:00',
                  end: '01:00',
                  type: 'shift',
                },
              ],
            },
          ],
        },
      ],
    };

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterPeriod);

    const { result } = renderHook(() => useRosterPeriod(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rosterPeriod.weeks).toHaveLength(2);
    expect(result.current.rosterPeriod.weeks[0].weekNumber).toBe(1);
    expect(result.current.rosterPeriod.weeks[1].weekNumber).toBe(2);
  });
});
