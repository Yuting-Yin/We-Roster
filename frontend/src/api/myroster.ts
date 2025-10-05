// frontend/src/api/myroster.ts
import { API_BASE } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types matching backend DTOs
export interface DayRosterDto {
  date: string;
  shifts: ShiftItemDto[];
}

export interface ShiftItemDto {
  id: number;
  startTs: string;
  endTs: string;
  dept: string;
  location: string;
  code: string; // AM, PM, AH
  isLead: boolean;
  coworkers: number;
  shiftName?: string; // e.g., "Emergency PFY"
}

export interface DayViewDto {
  date: string;
  window: DayWindowDto;
  allocated: AllocatedItemDto[];
  unallocated: UnallocatedItemDto[];
}

export interface DayWindowDto {
  start: string;
  end: string;
}

export interface AllocatedItemDto {
  shiftId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  location: LocationDto;
  designation: string;
  coworkerCount: number;
}

export interface UnallocatedItemDto {
  startTime: string;
  endTime: string;
  label: string;
}

export interface LocationDto {
  name: string;
  code?: string;
  type?: string;
}

export interface CalendarDayDto {
  date: string;
  assignedAM: boolean;
  assignedPM: boolean;
  isToday: boolean;
}

export interface RefreshResponse {
  week: {
    start: string;
    end: string;
  };
  days: CalendarDayDto[];
  timeline: DayRosterDto;
}

export interface ShiftDetailsDto {
  date: string;
  shiftId: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  location: LocationDto;
  designation: string;
  coworkers: CoworkerDto[];
}

export interface CoworkerDto {
  staffId: number;
  staffName: string;
  staffInitials: string;
}

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Helper function to make authenticated requests
async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`API Error ${response.status}: ${errorText || response.statusText}`);
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// API functions
export async function getDayRoster(date?: string): Promise<DayRosterDto> {
  const params = date ? `?date=${date}` : '';
  return fetchWithAuth<DayRosterDto>(`${API_BASE}/api/v1/myroster/day${params}`);
}

export async function getDayView(date: string): Promise<DayViewDto> {
  return fetchWithAuth<DayViewDto>(`${API_BASE}/api/v1/myroster/dayview?date=${date}`);
}

export async function refreshRoster(weekStart?: string, currentDate?: string): Promise<RefreshResponse> {
  const params = new URLSearchParams();
  if (weekStart) params.append('weekStart', weekStart);
  if (currentDate) params.append('currentDate', currentDate);
  
  const queryString = params.toString();
  const url = `${API_BASE}/api/v1/myroster/refresh${queryString ? `?${queryString}` : ''}`;
  
  return fetchWithAuth<RefreshResponse>(url);
}

export async function getShiftDetails(shiftId: number): Promise<ShiftDetailsDto> {
  return fetchWithAuth<ShiftDetailsDto>(`${API_BASE}/api/v1/myroster/shift/${shiftId}`);
}

export async function getCalendarRange(start: string, months: number = 1): Promise<CalendarDayDto[]> {
  return fetchWithAuth<CalendarDayDto[]>(`${API_BASE}/api/v1/calendar/range?start=${start}&months=${months}`);
}
