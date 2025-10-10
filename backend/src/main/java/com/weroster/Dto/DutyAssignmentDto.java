package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DutyAssignmentDto {
    private String staffId;
    private String staffName;
    private String staffInitials;
    private String staffDesignation;
    
    private String shiftId;
    private String shiftDate;
    private String shiftTime;
    
    private String locationName;
    private String hospitalName;
}
