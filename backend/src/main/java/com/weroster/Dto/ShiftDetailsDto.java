package com.weroster.dto;

import java.util.List;

public class ShiftDetailsDto {
    private String date;
    private Long shiftId;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private LocationDto location;
    private String designation;
    private List<CoworkerDto> coworkers;
    
    public ShiftDetailsDto() {}
    
    public ShiftDetailsDto(String date, Long shiftId, String startTime, String endTime, Integer durationMinutes, LocationDto location, String designation, List<CoworkerDto> coworkers) {
        this.date = date;
        this.shiftId = shiftId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.location = location;
        this.designation = designation;
        this.coworkers = coworkers;
    }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public Long getShiftId() { return shiftId; }
    public void setShiftId(Long shiftId) { this.shiftId = shiftId; }
    
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
    
    public List<CoworkerDto> getCoworkers() { return coworkers; }
    public void setCoworkers(List<CoworkerDto> coworkers) { this.coworkers = coworkers; }
}
