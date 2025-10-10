import { fetchJson } from '@/lib/api';

export interface DutyAssignmentData {
  staffId: string;
  staffName: string;
  staffInitials: string;
  staffDesignation: string;
  shiftId: string;
  shiftDate: string;
  shiftTime: string;
  locationName: string;
  hospitalName: string;
}

/**
 * Get today's duty assignments for dashboard
 */
export async function getTodayDutyAssignments(): Promise<DutyAssignmentData[]> {
  return fetchJson<DutyAssignmentData[]>('/api/v1/team-roster/duty-today');
}
