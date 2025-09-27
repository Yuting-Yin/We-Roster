package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeekDto {
    private String weekStart;
    private String weekEnd;
    private List<CalendarDayDto> days;
    
    public WeekDto(String weekStart, String weekEnd) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.days = new java.util.ArrayList<>();
    }
}
