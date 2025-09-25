package com.weroster.Dto;

public class DayWindowDto {
    private String startTime; // "HH:mm"
    private String endTime;   // "HH:mm"
    public DayWindowDto() {}
    public DayWindowDto(String startTime, String endTime) { this.startTime = startTime; this.endTime = endTime; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
}