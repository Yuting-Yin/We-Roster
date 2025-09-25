package com.weroster.Dto;

import java.util.List;

public class RefreshDto {
    private WeekDto week;
    private List<CalendarDayDto> days;
    private DayRosterDto timeline;

    public RefreshDto() {}
    public RefreshDto(WeekDto week, List<CalendarDayDto> days, DayRosterDto timeline) {
        this.week = week; this.days = days; this.timeline = timeline;
    }
    public WeekDto getWeek() { return week; }
    public List<CalendarDayDto> getDays() { return days; }
    public DayRosterDto getTimeline() { return timeline; }

    public static class WeekDto {
        private String start;
        private String end;
        public WeekDto() {}
        public WeekDto(String start, String end){ this.start=start; this.end=end; }
        public String getStart(){ return start; }
        public String getEnd(){ return end; }
    }
}
