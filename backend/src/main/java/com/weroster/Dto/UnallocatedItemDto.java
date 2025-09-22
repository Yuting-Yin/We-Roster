package com.weroster.Dto;

public class UnallocatedItemDto {
    private String startTime; // "HH:mm"
    private String endTime;   // "HH:mm"
    private String label;     // 固定 "Unallocated"
    public UnallocatedItemDto() {}
    public UnallocatedItemDto(String startTime, String endTime, String label) {
        this.startTime = startTime; this.endTime = endTime; this.label = label;
    }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public String getLabel() { return label; }
}
