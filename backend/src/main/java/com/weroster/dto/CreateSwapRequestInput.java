package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSwapRequestInput {
    private String requesterId;
    private String targetUserId;
    private String shiftId;
    private String date;
    private String start;
    private String end;
    private String message;
    private String createdAt;
}
