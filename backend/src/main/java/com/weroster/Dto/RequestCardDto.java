package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestCardDto {
    private String id;
    private String status; // AWAITING, APPROVED, DECLINED
    private String requestType; // Leave Request, Swap Request, Open Shift Request
    private String requestSubType; // Annual Leave, My Swap Request, Incoming Swap Request, etc.
    private String date; // Formatted date string like "Thursday, 15 Oct"
    private String timeRange; // Optional time range like "08:00 AM - 13:00 PM"
    private Boolean isIncomingSwap; // Special flag for incoming swap requests
    private Boolean needsResponse; // True if this request needs the current user to respond
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
    private String reason;
    private String shiftId; // ID of the related shift (if applicable)
    private String location; // Location name for shift-related requests
    private String address; // Address for shift-related requests
}
