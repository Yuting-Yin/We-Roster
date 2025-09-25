package com.weroster.dto;

public class UnallocatedItemDto {
    private String startTime;
    private String endTime;
    private String label;
    
    public UnallocatedItemDto() {}
    
    public UnallocatedItemDto(String startTime, String endTime, String label) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.label = label;
    }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
