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

