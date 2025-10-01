import { fetchJson } from "@/lib/api";

export type TeamMember = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  designationCode?: string;
  accreditation?: string;
  type?: string;
  isManager?: boolean;
  initials: string;
};

export type TeamMembersResponse = {
  members: TeamMember[];
  totalCount: number;
};

/**
 * Get all team members
 */
export async function getTeamMembers(): Promise<TeamMembersResponse> {
  return await fetchJson<TeamMembersResponse>(`/api/v1/team/members`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get shifts for a specific staff member
 * Returns a map of date -> shift types array
 */
export type StaffShiftsResponse = {
  staffId: number;
  staffName: string;
  shiftMap: Record<string, string[]>; // "2025-10-01" -> ["AM", "PM"]
};

export async function getStaffShifts(
  staffId: number,
  startDate: string, // "2025-09-01"
  months: number = 2
): Promise<StaffShiftsResponse> {
  return await fetchJson<StaffShiftsResponse>(
    `/api/v1/team/members/${staffId}/shifts?startDate=${startDate}&months=${months}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
}

