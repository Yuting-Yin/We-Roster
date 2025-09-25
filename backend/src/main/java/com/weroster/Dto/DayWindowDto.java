package com.weroster.dto;

public class DayWindowDto {
    private String start;
    private String end;
    
    public DayWindowDto() {}
    
    public DayWindowDto(String start, String end) {
        this.start = start;
        this.end = end;
    }
    
    public String getStart() { return start; }
    public void setStart(String start) { this.start = start; }
    
    public String getEnd() { return end; }
    public void setEnd(String end) { this.end = end; }
}
