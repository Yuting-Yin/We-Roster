import { fetchJson } from "@/lib/api";

export type CreateLeaveRequestInput = {
	requestType?: string | null; // e.g., Annual, Sick, etc.
	allDay: boolean;
	date: string; // YYYY-MM-DD
	start?: string | null; // HH:mm (if not all-day)
	end?: string | null;   // HH:mm (if not all-day)
	reason?: string;
	createdBy: { id: string; name?: string | null; email?: string | null };
	createdAt: string; // ISO string
	shiftId?: string | null; // associated shift id (null for All Day Leave)
};

export async function createLeaveRequest(input: CreateLeaveRequestInput) {
	return await fetchJson<{ id: string } | { success: boolean; error?: string; duplicate?: boolean }>("/api/v1/leaves", {
		method: "POST",
		body: input,
		headers: { "Content-Type": "application/json" },
	});
}

export type LeaveRequest = {
	id: number;
	requestDate: string;
	startTime: string;
	endTime: string;
	leaveType: string;
	status: string;
	reason?: string;
	shiftId?: number;
};

export async function getMyLeaves(month?: string) {
	const params = month ? `?month=${month}` : '';
	return await fetchJson<LeaveRequest[]>(`/api/v1/leaves/my-leaves${params}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
}

export async function getStaffLeaves(staffId: number, month?: string) {
	const params = month ? `?month=${month}` : '';
	return await fetchJson<LeaveRequest[]>(`/api/v1/leaves/staff/${staffId}/leaves${params}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
}