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
	return await fetchJson<{ id: string } | { success: boolean }>("/api/v1/swaps", {
		method: "POST",
		body: input,
		headers: { "Content-Type": "application/json" },
	});
}

export async function acceptSwapRequest(swapId: string) {
	return await fetchJson<{ success: boolean; message: string; status: string }>(`/api/v1/swaps/${swapId}/accept`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});
}

export async function declineSwapRequest(swapId: string) {
	return await fetchJson<{ success: boolean; message: string; status: string }>(`/api/v1/swaps/${swapId}/decline`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});
}