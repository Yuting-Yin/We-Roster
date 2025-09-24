import { fetchJson } from "@/lib/api";

export type CreateSwapRequestInput = {
	requesterId: string;
	targetUserId: string;
	shiftId?: string; // current shift id
	date: string; // YYYY-MM-DD
	start: string; // HH:mm
	end: string;   // HH:mm
	message?: string;
	createdAt: string; // ISO
};

export async function createSwapRequest(input: CreateSwapRequestInput) {
	return await fetchJson<{ id: string } | { success: boolean }>("/api/swaps", {
		method: "POST",
		body: input,
		headers: { "Content-Type": "application/json" },
	});
}
