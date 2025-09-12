// src/main/java/com/weroster/Dto/OpenShiftDto.java
package main.com.weroster.Dto;

import java.time.LocalDateTime;

public class OpenShiftDto {
    public Long shiftId;
    public LocalDateTime startTs;
    public LocalDateTime endTs;
    public Long deptId;
    public String deptName;
    public Long locationId;
    public String locationName;
    public String role;          // from shift.code (or null)
    public boolean urgent;       // from open_shift.urgent_flag (nullable -> false)
    public Integer extraPayCents; // from open_shift.extra_pay_cents (nullable -> 0)

    public OpenShiftDto() {}
    public OpenShiftDto(Long shiftId, LocalDateTime startTs, LocalDateTime endTs,
                        Long deptId, String deptName, Long locationId, String locationName,
                        String role, boolean urgent, Integer extraPayCents) {
        this.shiftId = shiftId; this.startTs = startTs; this.endTs = endTs;
        this.deptId = deptId; this.deptName = deptName; this.locationId = locationId;
        this.locationName = locationName; this.role = role;
        this.urgent = urgent; this.extraPayCents = extraPayCents;
    }
}
