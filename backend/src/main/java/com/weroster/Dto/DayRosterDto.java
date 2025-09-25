package com.weroster.dto;

import java.util.List;

public class DayRosterDto {
    private String date;
    private List<ShiftItem> shifts;
    
    public DayRosterDto() {}
    
    public DayRosterDto(String date, List<ShiftItem> shifts) {
        this.date = date;
        this.shifts = shifts;
    }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public List<ShiftItem> getShifts() { return shifts; }
    public void setShifts(List<ShiftItem> shifts) { this.shifts = shifts; }
}
