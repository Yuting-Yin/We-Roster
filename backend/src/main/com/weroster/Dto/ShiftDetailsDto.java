package main.com.weroster.Dto;

import java.util.List;

public class ShiftDetailsDto {
    public String date;
    public Long   shiftId;
    public String startTime;
    public String endTime;
    public int    durationMinutes;
    public LocationDto location;
    public String designation;
    public List<CoworkerDto> coworkers;

    public ShiftDetailsDto() {}

    public ShiftDetailsDto(String date, Long shiftId, String startTime, String endTime,
                           int durationMinutes, LocationDto location, String designation,
                           List<CoworkerDto> coworkers) {
        this.date = date;
        this.shiftId = shiftId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.location = location;
        this.designation = designation;
        this.coworkers = coworkers;
    }
}