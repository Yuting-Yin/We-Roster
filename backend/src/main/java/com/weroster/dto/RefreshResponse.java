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
public class RefreshResponse {
    private String token;
    private String refreshToken;
    private WeekDto week;
    private List<CalendarDayDto> calendarDays;
    private DayRosterDto timeline;
    
    public RefreshResponse(WeekDto week, List<CalendarDayDto> calendarDays, DayRosterDto timeline) {
        this.week = week;
        this.calendarDays = calendarDays;
        this.timeline = timeline;
    }
}
