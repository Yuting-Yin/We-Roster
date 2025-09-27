package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDayDto {
    private String date;
    private String dayName;
    private boolean isToday;
    private boolean isWeekend;
    private boolean isHoliday;
    private List<ShiftItem> shifts;
    
    public CalendarDayDto(String date, boolean isToday, boolean isWeekend, boolean isHoliday) {
        this.date = date;
        this.isToday = isToday;
        this.isWeekend = isWeekend;
        this.isHoliday = isHoliday;
        this.shifts = new ArrayList<>();
    }
}
