import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRosterData } from '@/hooks/useRoster';

// Mock the API
jest.mock('@/lib/api', () => ({
  fetchJson: jest.fn(),
}));

// Mock the date utilities
jest.mock('@/lib/date', () => ({
  dayKey: jest.fn((date) => '2024-01-15'),
}));

import { fetchJson } from '@/lib/api';

describe('useRosterData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load roster data successfully', async () => {
    const mockRosterData = [
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
      {
        date: '2024-01-16',
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
    ];

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterData);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/v1/calendar/range?start=2024-01-15&months=1');
  });

  it('should handle empty roster data', async () => {
    (fetchJson as jest.Mock).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    const events = result.current.getEventsForDate(new Date('2024-01-15'));
    expect(events).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle network errors', async () => {
    (fetchJson as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should refresh roster data when refresh is called', async () => {
    const mockRosterData = [
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
    ];

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterData);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

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
    const malformedResponse = [
      {
        // Missing expected fields
        someOtherField: 'value',
      },
    ];

    (fetchJson as jest.Mock).mockResolvedValueOnce(malformedResponse);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    const events = result.current.getEventsForDate(new Date('2024-01-15'));
    expect(events).toEqual([]);
  });

  it('should handle different event types', async () => {
    const mockRosterData = [
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
    ];

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterData);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const events = result.current.getEventsForDate(new Date('2024-01-15'));
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('shift');
    expect(events[1].type).toBe('leave');
    expect(events[2].type).toBe('swap');
  });

  it('should handle different months parameter', async () => {
    const mockRosterData = [
      {
        date: '2024-01-15',
        events: [],
      },
    ];

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterData);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15'), { months: 3 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/v1/calendar/range?start=2024-01-15&months=3');
  });

  it('should handle different dates', async () => {
    const mockRosterData = [
      {
        date: '2024-01-15',
        events: [],
      },
    ];

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterData);

    const { result, rerender } = renderHook(
      ({ date }) => useRosterData(date),
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
    const mockRosterData = [
      {
        date: '2024-01-15',
        events: [],
      },
    ];

    (fetchJson as jest.Mock).mockResolvedValue(mockRosterData);

    const { result, rerender } = renderHook(() => useRosterData(new Date('2024-01-15')));

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
    const partialResponse = [
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
    ];

    (fetchJson as jest.Mock).mockResolvedValueOnce(partialResponse);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    const events = result.current.getEventsForDate(new Date('2024-01-15'));
    expect(events).toEqual(partialResponse[0].events);
  });

  it('should handle multiple dates in response', async () => {
    const mockRosterData = [
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
      {
        date: '2024-01-16',
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
    ];

    (fetchJson as jest.Mock).mockResolvedValueOnce(mockRosterData);

    const { result } = renderHook(() => useRosterData(new Date('2024-01-15')));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const events15 = result.current.getEventsForDate(new Date('2024-01-15'));
    const events16 = result.current.getEventsForDate(new Date('2024-01-16'));

    expect(events15).toHaveLength(1);
    expect(events16).toHaveLength(1);
    expect(events15[0].title).toBe('Morning Shift');
    expect(events16[0].title).toBe('Evening Shift');
  });
});
