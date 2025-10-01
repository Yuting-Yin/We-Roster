package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignationRequirementDto {
    
    private Long designationId;
    private String designationName;
    private Integer requiredCount;
    private Integer currentCount; // How many staff with this designation are currently assigned
}
