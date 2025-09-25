package com.weroster.dto;

public class CalendarDayDto {
    private String date;
    private Boolean assignedAM;
    private Boolean assignedPM;
    private Boolean isToday;
    
    public CalendarDayDto() {}
    
    public CalendarDayDto(String date, Boolean assignedAM, Boolean assignedPM, Boolean isToday) {
        this.date = date;
        this.assignedAM = assignedAM;
        this.assignedPM = assignedPM;
        this.isToday = isToday;
    }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public Boolean getAssignedAM() { return assignedAM; }
    public void setAssignedAM(Boolean assignedAM) { this.assignedAM = assignedAM; }
    
    public Boolean getAssignedPM() { return assignedPM; }
    public void setAssignedPM(Boolean assignedPM) { this.assignedPM = assignedPM; }
    
    public Boolean getIsToday() { return isToday; }
    public void setIsToday(Boolean isToday) { this.isToday = isToday; }
}
