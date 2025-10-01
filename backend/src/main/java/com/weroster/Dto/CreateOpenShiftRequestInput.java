package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOpenShiftRequestInput {
    
    private Long openShiftId;
    private String message; // Optional message from applicant
}
