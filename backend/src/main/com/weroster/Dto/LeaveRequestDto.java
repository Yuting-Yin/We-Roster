// src/main/com/weroster/Dto/LeaveRequestDto.java
package main.com.weroster.Dto;

public class LeaveRequestDto {
    public Long   shiftId;     // "shiftId"
    public String leaveType;   // "Annual" / "Casual" / "Sick" / ...
    public boolean allDay;     // 是否全天
    public String date;        // yyyy-MM-dd
    public String startTime;   // HH:mm
    public String endTime;     // HH:mm

    public LeaveRequestDto() {}
    public LeaveRequestDto(Long shiftId, String leaveType, boolean allDay,
                           String date, String startTime, String endTime) {
        this.shiftId = shiftId;
        this.leaveType = leaveType;
        this.allDay = allDay;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
