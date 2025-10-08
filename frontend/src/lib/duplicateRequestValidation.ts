// src/lib/duplicateRequestValidation.ts
import { LeaveItem } from "@/types/dashboard";
import { dayKey } from "@/lib/date";

/**
 * Check if a leave request would be a duplicate based on existing requests
 * Only considers APPROVED and AWAITING requests as duplicates
 * DECLINED requests are allowed to be requested again
 * 
 * @param existingLeaves - Array of existing leave requests
 * @param requestDate - The date for the new request (Date object)
 * @param requestType - The type of leave being requested (optional)
 * @returns Object with isDuplicate flag and duplicateInfo if found
 */
export const checkLeaveRequestDuplicate = (
  existingLeaves: LeaveItem[],
  requestDate: Date,
  requestType?: string
): { isDuplicate: boolean; duplicateInfo?: LeaveItem } => {
  if (!existingLeaves || existingLeaves.length === 0) {
    return { isDuplicate: false };
  }

  const requestDateKey = dayKey(requestDate);
  
  // Find existing requests for the same date
  const sameDateRequests = existingLeaves.filter(leave => {
    // Extract date from leave.date (format: "Wed, 14 May" or "2025-10-15")
    let leaveDateKey: string;
    
    if (leave.date.includes(',')) {
      // Format: "Wed, 14 May" - extract the date part
      const datePart = leave.date.split(',')[1]?.trim();
      if (datePart) {
        // Convert "14 May" to a proper date key
        const currentYear = new Date().getFullYear();
        const dateObj = new Date(`${datePart} ${currentYear}`);
        leaveDateKey = dayKey(dateObj);
      } else {
        return false;
      }
    } else {
      // Format: "2025-10-15" - use as is
      leaveDateKey = leave.date;
    }
    
    return leaveDateKey === requestDateKey;
  });

  // Check for duplicates - only consider APPROVED and AWAITING requests
  const duplicateRequest = sameDateRequests.find(leave => {
    const state = leave.state?.toUpperCase();
    return state === 'APPROVED' || state === 'AWAITING' || state === 'PENDING';
  });

  if (duplicateRequest) {
    return {
      isDuplicate: true,
      duplicateInfo: duplicateRequest
    };
  }

  return { isDuplicate: false };
};

/**
 * Get a user-friendly error message for duplicate requests
 * @param duplicateInfo - The duplicate leave request information
 * @returns Error message string
 */
export const getDuplicateRequestErrorMessage = (duplicateInfo: LeaveItem): string => {
  const state = duplicateInfo.state?.toUpperCase();
  const dateStr = duplicateInfo.date;
  const typeStr = duplicateInfo.type || 'leave request';
  
  return `A ${state.toLowerCase()} ${typeStr} already exists for ${dateStr}. Please check your existing requests.`;
};
