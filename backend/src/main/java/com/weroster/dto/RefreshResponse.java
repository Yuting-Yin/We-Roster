package com.weroster.dto;

import java.util.List;

public class RefreshResponse {
    private WeekDto week;
    private List<CalendarDayDto> days;
    private DayRosterDto timeline;
    
    public RefreshResponse() {}
    
    public RefreshResponse(WeekDto week, List<CalendarDayDto> days, DayRosterDto timeline) {
        this.week = week;
        this.days = days;
        this.timeline = timeline;
    }
    
    public WeekDto getWeek() { return week; }
    public void setWeek(WeekDto week) { this.week = week; }
    
    public List<CalendarDayDto> getDays() { return days; }
    public void setDays(List<CalendarDayDto> days) { this.days = days; }
    
    public DayRosterDto getTimeline() { return timeline; }
    public void setTimeline(DayRosterDto timeline) { this.timeline = timeline; }
}
