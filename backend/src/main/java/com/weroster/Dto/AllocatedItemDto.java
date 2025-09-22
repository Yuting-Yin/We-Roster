package com.weroster.Dto;

public class AllocatedItemDto {
    private String shiftId;        // "sh_<id>"
    private String startTime;      // "HH:mm"
    private String endTime;        // "HH:mm"
    private int durationMinutes;   // TIMESTAMPDIFF(MINUTE)
    private LocationDto location;  // campus + address
    private String designation;    // 员工职称（表里没有就 null）
    private int coworkerCount;     // 同班同事数（不含自己）

    public AllocatedItemDto() {}
    public AllocatedItemDto(String shiftId, String startTime, String endTime,
                            int durationMinutes, LocationDto location,
                            String designation, int coworkerCount) {
        this.shiftId = shiftId; this.startTime = startTime; this.endTime = endTime;
        this.durationMinutes = durationMinutes; this.location = location;
        this.designation = designation; this.coworkerCount = coworkerCount;
    }
    public String getShiftId() { return shiftId; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public int getDurationMinutes() { return durationMinutes; }
    public LocationDto getLocation() { return location; }
    public String getDesignation() { return designation; }
    public int getCoworkerCount() { return coworkerCount; }
}
