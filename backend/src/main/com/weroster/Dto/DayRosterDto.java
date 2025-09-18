package main.com.weroster.Dto;

import java.util.List;

public class DayRosterDto {
    private String date;
    private List<ShiftItemDto> shifts;

    public DayRosterDto() {}
    public DayRosterDto(String date, List<ShiftItemDto> shifts) {
        this.date = date; this.shifts = shifts;
    }

    public String getDate() { return date; }
    public List<ShiftItemDto> getShifts() { return shifts; }
}