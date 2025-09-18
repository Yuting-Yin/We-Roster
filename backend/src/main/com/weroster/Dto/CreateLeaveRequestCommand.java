// src/main/com/weroster/Dto/CreateLeaveRequestCommand.java
package main.com.weroster.Dto;

public class CreateLeaveRequestCommand {
    public Long   shiftId;
    public String leaveType;   // "Annual" / "Casual" / "Sick" / ...
    public boolean allDay;
    public String date;        // yyyy-MM-dd
    public String startTime;   // HH:mm（allDay=true 可为空）
    public String endTime;     // HH:mm（allDay=true 可为空）
}
