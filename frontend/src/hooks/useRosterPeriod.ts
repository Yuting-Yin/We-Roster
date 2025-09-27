// src/hooks/useRosterPeriod.ts
import { useMemo } from 'react';
import {
  getRosterPeriodForDate,
  getCurrentRosterPeriod,
  getRosterPeriodMonths,
  type RosterPeriod,
} from '@/lib/rosterPeriods';

export function useRosterPeriod(date?: Date) {
  const targetDate = date || new Date();
  
  const currentPeriod = useMemo(() => getCurrentRosterPeriod(), []);
  const periodForDate = useMemo(() => getRosterPeriodForDate(targetDate), [targetDate]);
  const months = useMemo(() => getRosterPeriodMonths(targetDate), [targetDate]);

  return {
    currentPeriod,
    periodForDate,
    months,
    isInCurrentPeriod: currentPeriod?.id === periodForDate?.id,
  };
}
