package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLeaveRequestInput {
    private String requestType;
    private Boolean allDay;
    private String date;
    private String start;
    private String end;
    private String reason;
    private UserInfo createdBy;
    private String createdAt;
    private String shiftId;
}
