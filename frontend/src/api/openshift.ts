import { fetchJson } from "@/lib/api";

export type OpenShiftDto = {
  id: number;
  startTs: string;
  endTs: string;
  date: string; // YYYY-MM-DD format
  start: string; // HH:mm format
  end: string; // HH:mm format
  session: "AM" | "PM" | "AH" | "ON_CALL";
  departmentName?: string;
  locationName?: string;
  code: string;
  note?: string;
  paymentCents?: number;
  formattedPayment: string;
  status: "AVAILABLE" | "READY_TO_RUN" | "APPROVED_FOR_FORMAL" | "CANCELLED";
  createdAt: string;
  urgentFlag: boolean;
  createdByName?: string;
  designationRequirements: DesignationRequirementDto[];
  assignedStaff: CoworkerDto[];
  canApply: boolean;
  applicationStatus?: "PENDING" | "APPROVED" | "DECLINED" | "WITHDRAWN";
};

export type DesignationRequirementDto = {
  designationId: number;
  designationName: string;
  requiredCount: number;
  currentCount: number;
};

export type CoworkerDto = {
  id: string;
  name: string;
  initials: string;
  designationName?: string;
  isLead: boolean;
};

export type CreateOpenShiftRequestInput = {
  openShiftId: number;
  message?: string;
};

export type OpenShiftsWeekResponse = {
  openShifts: Record<string, OpenShiftDto[]>; // Key is date (YYYY-MM-DD), value is array of open shifts
  weekStart: string;
  totalCount: number;
};

export type OpenShiftDetailsResponse = {
  openShift: OpenShiftDto;
};

export type ApplyOpenShiftResponse = {
  message: string;
  requestId: number;
  status: string;
};

/**
 * Get open shifts for a specific week
 */
export async function getOpenShiftsForWeek(
  startDate: string, // YYYY-MM-DD format
  userEmail?: string
): Promise<OpenShiftsWeekResponse> {
  const params = new URLSearchParams({ startDate });
  if (userEmail) {
    params.append("userEmail", userEmail);
  }
  
  return await fetchJson<OpenShiftsWeekResponse>(`/api/v1/openshifts/week?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Get open shift details by ID
 */
export async function getOpenShiftDetails(
  id: number,
  userEmail?: string
): Promise<OpenShiftDetailsResponse> {
  const params = new URLSearchParams();
  if (userEmail) {
    params.append("userEmail", userEmail);
  }
  
  return await fetchJson<OpenShiftDetailsResponse>(`/api/v1/openshifts/${id}?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Apply for an open shift
 */
export async function applyForOpenShift(
  input: CreateOpenShiftRequestInput,
  userEmail: string
): Promise<ApplyOpenShiftResponse> {
  const params = new URLSearchParams({ userEmail });
  
  return await fetchJson<ApplyOpenShiftResponse>(`/api/v1/openshifts/apply?${params}`, {
    method: "POST",
    body: input,
    headers: { "Content-Type": "application/json" },
  });
}
