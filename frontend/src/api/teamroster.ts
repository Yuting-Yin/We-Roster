// frontend/src/api/teamroster.ts
import { fetchJson } from '../lib/api';

// Types for team roster API responses
export interface TeamRosterShiftDto {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  assignedStaff: {
    id: string;
    name: string;
    initials: string;
    designation: string;
  }[];
}

export interface TeamRosterCellDto {
  room: string;
  shiftType: "AM" | "PM" | "AH" | "ON_CALL";
  shifts: TeamRosterShiftDto[];
}

export interface TeamRosterTableDto {
  hospital: string;
  rooms: string[];
  cells: TeamRosterCellDto[];
}

export interface TeamRosterResponse {
  date: string;
  tables: TeamRosterTableDto[];
}

/**
 * Get team roster data for a specific date
 */
export async function getTeamRoster(date: string): Promise<TeamRosterResponse> {
  const params = new URLSearchParams({
    date: date,
  });
  
  return await fetchJson<TeamRosterResponse>(`/api/v1/team-roster?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get team roster data for a date range (week)
 */
export async function getTeamRosterWeek(startDate: string, endDate: string): Promise<TeamRosterResponse[]> {
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate,
  });
  
  return await fetchJson<TeamRosterResponse[]>(`/api/v1/team-roster/week?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get available dates that have shift data
 */
export async function getAvailableDates(): Promise<string[]> {
  return await fetchJson<string[]>('/api/v1/team-roster/available-dates', {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get available filter options for team roster
 */
export interface TeamRosterFilterOptions {
  shiftTypes: string[];
  designations: string[];
}

export async function getTeamRosterFilterOptions(): Promise<TeamRosterFilterOptions> {
  return await fetchJson<TeamRosterFilterOptions>('/api/v1/team-roster/filter-options', {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
