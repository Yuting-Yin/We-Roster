package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftDetailsDto {
    
    private String date;
    private Long shiftId;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private LocationDto location;
    private String designation;
    private List<CoworkerDto> coworkers;
}
