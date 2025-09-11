package main.com.weroster.Dto;

import java.time.Instant;

public class OpenShiftDto {
    public Long shiftId;
    public Instant dateMade;

    public OpenShiftDto() {}
    public OpenShiftDto(Long shiftId, Instant dateMade) {
        this.shiftId = shiftId;
        this.dateMade = dateMade;
    }
}
