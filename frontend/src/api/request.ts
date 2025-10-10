// src/api/request.ts
import { fetchJson } from "@/lib/api";
import { Request, RequestCardData, RequestStatus } from "@/types/request";

// Backend RequestCardDto structure (matches what the backend actually returns)
interface RequestCardDto {
  id: string;
  status: RequestStatus;
  requestType: string;
  requestSubType: string;
  date: string; // Already formatted by backend
  timeRange?: string; // Already formatted by backend
  isIncomingSwap?: boolean;
  needsResponse?: boolean; // True if this request needs the current user to respond
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
  shiftId?: string; // ID of the related shift (if applicable)
  location?: string; // Location name for shift-related requests
  address?: string; // Address for shift-related requests
}

// Backend response structure
interface RequestsResponseDto {
  requests: RequestCardDto[];
  totalCount: number;
  message: string;
}

export interface GetRequestsParams {
  userId?: string;
  month?: number; // 0-11 (JavaScript month format)
  year?: number;
  status?: RequestStatus;
}

export interface GetRequestsResponse {
  requests: Request[];
  totalCount: number;
}

export interface CreateLeaveRequestData {
  requestSubType: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  notes?: string;
}

export interface CreateSwapRequestData {
  requestSubType: string;
  originalShiftId: string;
  targetShiftId?: string;
  swapWithUserId?: string;
  reason?: string;
  notes?: string;
}

export interface CreateOpenShiftRequestData {
  openShiftId: string;
  reason?: string;
  notes?: string;
}

export interface RespondToSwapRequestData {
  requestId: string;
  action: "approve" | "decline";
  reason?: string;
}

// Get user's requests for a specific month
export async function getRequests(params: GetRequestsParams): Promise<GetRequestsResponse> {
  const response = await fetchJson<GetRequestsResponse>("/api/v1/requests", {
    method: "GET",
    // Add params as query string
  });
  return response;
}

// Get awaiting requests (IN ACTION tab)
export async function getAwaitingRequests(month?: number, year?: number): Promise<RequestCardData[]> {
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', month.toString());
  if (year !== undefined) params.append('year', year.toString());
  
  const url = `/api/v1/requests/awaiting${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchJson<RequestsResponseDto>(url, { 
    method: "GET"
  });
  // Backend already returns RequestCardDto which matches RequestCardData
  return (response.requests || []).map(dto => ({
    id: dto.id,
    status: dto.status,
    requestType: dto.requestType as any, // Backend returns string, frontend expects union type
    requestSubType: dto.requestSubType as any, // Backend returns string, frontend expects union type
    date: dto.date,
    timeRange: dto.timeRange,
    isIncomingSwap: dto.isIncomingSwap,
    needsResponse: dto.needsResponse,
    shiftId: dto.shiftId,
    location: dto.location,
    address: dto.address
  }));
}

// Get history requests (HISTORY tab)
export async function getHistoryRequests(month?: number, year?: number): Promise<RequestCardData[]> {
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', month.toString());
  if (year !== undefined) params.append('year', year.toString());
  
  const url = `/api/v1/requests/history${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchJson<RequestsResponseDto>(url, { 
    method: "GET"
  });
  // Backend already returns RequestCardDto which matches RequestCardData
  return (response.requests || []).map(dto => ({
    id: dto.id,
    status: dto.status,
    requestType: dto.requestType as any, // Backend returns string, frontend expects union type
    requestSubType: dto.requestSubType as any, // Backend returns string, frontend expects union type
    date: dto.date,
    timeRange: dto.timeRange,
    isIncomingSwap: dto.isIncomingSwap,
    needsResponse: dto.needsResponse,
    shiftId: dto.shiftId,
    location: dto.location,
    address: dto.address
  }));
}

// Create a new leave request
export async function createLeaveRequest(data: CreateLeaveRequestData): Promise<Request> {
  const response = await fetchJson<Request>("/api/v1/requests/leave", {
    method: "POST",
    body: data,
  });
  return response;
}

// Create a new swap request
export async function createSwapRequest(data: CreateSwapRequestData): Promise<Request> {
  const response = await fetchJson<Request>("/api/v1/requests/swap", {
    method: "POST",
    body: data,
  });
  return response;
}

// Create a new open shift request
export async function createOpenShiftRequest(data: CreateOpenShiftRequestData): Promise<Request> {
  const response = await fetchJson<Request>("/api/v1/requests/openshift", {
    method: "POST",
    body: data,
  });
  return response;
}

// Respond to an incoming swap request
export async function respondToSwapRequest(data: RespondToSwapRequestData): Promise<Request> {
  const response = await fetchJson<Request>(`/api/v1/requests/${data.requestId}/respond`, {
    method: "POST",
    body: {
      action: data.action,
      reason: data.reason,
    },
  });
  return response;
}

// Cancel a pending request
export async function cancelRequest(requestId: string): Promise<void> {
  await fetchJson(`/api/v1/requests/${requestId}`, {
    method: "DELETE",
  });
}

// Get request details
export async function getRequestDetails(requestId: string): Promise<Request> {
  const response = await fetchJson<Request>(`/api/v1/requests/${requestId}`, {
    method: "GET",
  });
  return response;
}
