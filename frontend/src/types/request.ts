// src/types/request.ts

export type RequestStatus = "AWAITING" | "APPROVED" | "DECLINED";

export type LeaveRequestSubType = "Shift Leave" | "Day Leave" | "Week Leave" | "Month Leave" | "Annual Leave";

export type SwapRequestSubType = "My Swap Request" | "Incoming Swap Request";

export type RequestType = "Leave Request" | "Swap Request" | "Open Shift Request";

export interface Request {
  id: string;
  status: RequestStatus;
  requestType: RequestType;
  requestSubType: LeaveRequestSubType | SwapRequestSubType;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string (optional for single day requests)
  startTime?: string; // "08:00" format for shift-specific requests
  endTime?: string; // "13:00" format for shift-specific requests
  submittedAt: string; // ISO datetime string
  reviewedAt?: string; // ISO datetime string
  reviewedBy?: string; // User ID of reviewer
  reason?: string; // Reason for the request
  notes?: string; // Additional notes
  
  // For swap requests
  swapWithUserId?: string; // User ID to swap with
  swapWithUserName?: string; // Display name of user to swap with
  originalShiftId?: string; // Original shift being swapped
  targetShiftId?: string; // Target shift to swap to
  
  // For leave requests
  leaveDays?: number; // Number of leave days
  
  // For open shift requests
  openShiftId?: string; // ID of the open shift being requested
}

export interface RequestCardData {
  id: string;
  status: RequestStatus;
  requestType: RequestType;
  requestSubType: LeaveRequestSubType | SwapRequestSubType;
  date: string; // Display date (e.g., "Thursday, 15 Oct")
  timeRange?: string; // Display time range (e.g., "08:00 AM - 13:00 PM")
  isIncomingSwap?: boolean; // Special flag for incoming swap requests
}
