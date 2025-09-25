package com.weroster.dto;

import java.util.List;

public class DayViewDto {
    private String date;
    private DayWindowDto window;
    private List<AllocatedItemDto> allocated;
    private List<UnallocatedItemDto> unallocated;
    
    public DayViewDto() {}
    
    public DayViewDto(String date, DayWindowDto window, List<AllocatedItemDto> allocated, List<UnallocatedItemDto> unallocated) {
        this.date = date;
        this.window = window;
        this.allocated = allocated;
        this.unallocated = unallocated;
    }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public DayWindowDto getWindow() { return window; }
    public void setWindow(DayWindowDto window) { this.window = window; }
    
    public List<AllocatedItemDto> getAllocated() { return allocated; }
    public void setAllocated(List<AllocatedItemDto> allocated) { this.allocated = allocated; }
    
    public List<UnallocatedItemDto> getUnallocated() { return unallocated; }
    public void setUnallocated(List<UnallocatedItemDto> unallocated) { this.unallocated = unallocated; }
}
