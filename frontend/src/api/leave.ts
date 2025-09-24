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
	shiftId?: string; // associated shift id
};

export async function createLeaveRequest(input: CreateLeaveRequestInput) {
	return await fetchJson<{ id: string } | { success: boolean }>("/api/leaves", {
		method: "POST",
		body: input,
		headers: { "Content-Type": "application/json" },
	});
}
