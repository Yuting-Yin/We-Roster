import { fmt, dayKey } from '@/lib/date';

describe('Date Utils', () => {
  describe('fmt', () => {
    it('should format date with default options', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = fmt(date, {});
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format date with custom options', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = fmt(date, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle different dates', () => {
      const date1 = new Date('2024-12-31T23:59:59Z');
      const date2 = new Date('2024-02-29T12:00:00Z');
      
      const result1 = fmt(date1, { year: 'numeric', month: 'long', day: 'numeric' });
      const result2 = fmt(date2, { year: 'numeric', month: 'long', day: 'numeric' });
      
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });
  });

  describe('dayKey', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = dayKey(date);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle different dates correctly', () => {
      const testCases = [
        { date: new Date(2024, 0, 1), expected: '2024-01-01' },
        { date: new Date(2024, 11, 31), expected: '2024-12-31' },
        { date: new Date(2024, 1, 29), expected: '2024-02-29' },
        { date: new Date(2023, 11, 31), expected: '2023-12-31' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(dayKey(date)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      // First day of year
      const startYear = new Date(2024, 0, 1);
      expect(dayKey(startYear)).toBe('2024-01-01');

      // Last day of year
      const endYear = new Date(2024, 11, 31);
      expect(dayKey(endYear)).toBe('2024-12-31');

      // Leap year February 29th
      const leapDay = new Date(2024, 1, 29);
      expect(dayKey(leapDay)).toBe('2024-02-29');
    });

    it('should be consistent with different time components', () => {
      const times = [0, 12, 23];
      
      times.forEach(hour => {
        const date = new Date(2024, 0, 15, hour, 0, 0);
        expect(dayKey(date)).toBe('2024-01-15');
      });
    });

    it('should handle timezone differences', () => {
      // Test with different timezones but same date
      const localDate = new Date(2024, 0, 15, 0, 0, 0);
      const localDate2 = new Date(2024, 0, 15, 12, 0, 0);
      
      expect(dayKey(localDate)).toBe('2024-01-15');
      expect(dayKey(localDate2)).toBe('2024-01-15');
    });
  });
});