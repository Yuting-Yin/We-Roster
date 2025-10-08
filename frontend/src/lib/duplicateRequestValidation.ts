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
  
  // Find existing requests that overlap with the requested date
  const overlappingRequests = existingLeaves.filter(leave => {
    // Check if the requested date falls within the leave period
    return isDateInLeaveRange(requestDate, leave);
  });

  // Check for duplicates - only consider APPROVED and AWAITING requests
  const duplicateRequest = overlappingRequests.find(leave => {
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
 * Check if a date falls within a leave request's date range
 * @param date - The date to check
 * @param leave - The leave request to check against
 * @returns true if the date falls within the leave period
 */
const isDateInLeaveRange = (date: Date, leave: LeaveItem): boolean => {
  // If we have startTime and endTime, use those for precise range checking
  if (leave.startTime && leave.endTime) {
    try {
      const startDate = new Date(leave.startTime);
      const endDate = new Date(leave.endTime);
      
      // Normalize dates to midnight for date-only comparison
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly;
    } catch (error) {
      console.warn('Error parsing leave date range:', error);
    }
  }
  
  // Fallback: try to parse the date field
  try {
    // Handle different date formats
    if (leave.date.includes(' - ')) {
      // Range format like "Oct 1 - Oct 31"
      const [startStr, endStr] = leave.date.split(' - ');
      const startDate = parseDateString(startStr.trim());
      const endDate = parseDateString(endStr.trim());
      
      if (startDate && endDate) {
        const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        return checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly;
      }
    } else if (leave.date.includes(',')) {
      // Single date format like "Wed, 14 May"
      const datePart = leave.date.split(',')[1]?.trim();
      if (datePart) {
        const parsedDate = parseDateString(datePart);
        if (parsedDate) {
          const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const parsedDateOnly = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
          return checkDateOnly.getTime() === parsedDateOnly.getTime();
        }
      }
    } else {
      // ISO date format like "2025-10-15"
      const parsedDate = new Date(leave.date + 'T00:00:00.000Z');
      if (!isNaN(parsedDate.getTime())) {
        const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const parsedDateOnly = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
        return checkDateOnly.getTime() === parsedDateOnly.getTime();
      }
    }
  } catch (error) {
    console.warn('Error parsing leave date:', error);
  }
  
  return false;
};

/**
 * Parse a date string like "Oct 1" or "14 May" into a Date object
 * @param dateStr - The date string to parse
 * @returns Date object or null if parsing fails
 */
const parseDateString = (dateStr: string): Date | null => {
  try {
    const currentYear = new Date().getFullYear();
    const dateObj = new Date(`${dateStr} ${currentYear}`);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj;
  } catch (error) {
    return null;
  }
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
