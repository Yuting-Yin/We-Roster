package main.com.weroster.Dto;

import java.util.List;

public class DayViewDto {
    private String date;             // "YYYY-MM-DD"
    private DayWindowDto dayWindow;  // {"startTime","endTime"}
    private List<AllocatedItemDto> allocated;
    private List<UnallocatedItemDto> unallocated;

    public DayViewDto() {}
    public DayViewDto(String date, DayWindowDto dayWindow,
                      List<AllocatedItemDto> allocated, List<UnallocatedItemDto> unallocated) {
        this.date = date; this.dayWindow = dayWindow; this.allocated = allocated; this.unallocated = unallocated;
    }
    public String getDate() { return date; }
    public DayWindowDto getDayWindow() { return dayWindow; }
    public List<AllocatedItemDto> getAllocated() { return allocated; }
    public List<UnallocatedItemDto> getUnallocated() { return unallocated; }
}
