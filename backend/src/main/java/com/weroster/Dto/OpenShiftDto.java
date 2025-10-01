package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenShiftDto {
    
    private Long id;
    private LocalDateTime startTs;
    private LocalDateTime endTs;
    private String date; // YYYY-MM-DD format for frontend
    private String start; // HH:mm format for frontend
    private String end; // HH:mm format for frontend
    private String session; // AM, PM, AH, ON_CALL
    private String departmentName;
    private String locationName;
    private String hospitalName; // Hospital name
    private String hospitalAddress; // Hospital physical address
    private String type; // Shift type: AM, PM, AH, ON_CALL
    private String note;
    private Integer paymentCents;
    private String formattedPayment;
    private String status;
    private LocalDateTime createdAt;
    private Boolean urgentFlag;
    private String createdByName;
    private List<DesignationRequirementDto> designationRequirements;
    private List<CoworkerDto> assignedStaff;
    private Boolean canApply; // Whether current user can apply
    private String applicationStatus; // PENDING, APPROVED, DECLINED, WITHDRAWN, or null if no application
}
