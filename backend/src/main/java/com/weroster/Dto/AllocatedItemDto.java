package com.weroster.dto;

public class AllocatedItemDto {
    private String shiftId;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private LocationDto location;
    private String designation;
    private Integer coworkerCount;
    
    public AllocatedItemDto() {}
    
    public AllocatedItemDto(String shiftId, String startTime, String endTime, Integer durationMinutes, LocationDto location, String designation, Integer coworkerCount) {
        this.shiftId = shiftId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.location = location;
        this.designation = designation;
        this.coworkerCount = coworkerCount;
    }
    
    public String getShiftId() { return shiftId; }
    public void setShiftId(String shiftId) { this.shiftId = shiftId; }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public LocationDto getLocation() { return location; }
    public void setLocation(LocationDto location) { this.location = location; }
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public Integer getCoworkerCount() { return coworkerCount; }
    public void setCoworkerCount(Integer coworkerCount) { this.coworkerCount = coworkerCount; }
}
