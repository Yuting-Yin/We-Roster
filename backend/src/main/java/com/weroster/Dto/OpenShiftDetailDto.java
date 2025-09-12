package com.weroster.Dto;

import java.time.Instant;

public class OpenShiftDetailDto {
    public Long shiftId;
    public Instant startTs;
    public Instant endTs;
    public Long deptId;
    public Long locationId;
    public String code;
    public Instant dateMade;

    public OpenShiftDetailDto() {}

    public OpenShiftDetailDto(Long shiftId, Instant startTs, Instant endTs,
                              Long deptId, Long locationId, String code, Instant dateMade) {
        this.shiftId = shiftId;
        this.startTs = startTs;
        this.endTs = endTs;
        this.deptId = deptId;
        this.locationId = locationId;
        this.code = code;
        this.dateMade = dateMade;
    }
}
