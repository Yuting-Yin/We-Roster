// src/main/com/weroster/dto/SwapSubmitCommand.java
package main.com.weroster.Dto;

public class SwapSubmitCommand {
    public Long requesterShiftId; // 由 PathVariable 注入，不需要前端传
    public Long targetStaffId;    // 对方员工 ID
    public Long targetShiftId;    // 对方的班次 ID
}
