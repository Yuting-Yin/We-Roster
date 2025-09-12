package com.weroster.Dto;

import java.time.OffsetDateTime;

public class ShiftPreviewDto {
    public Long shiftId;
    public java.time.LocalDateTime startTs;
    public java.time.LocalDateTime endTs;
    public Long locationId;
    public String locationName;

    public ShiftPreviewDto() {}
    public ShiftPreviewDto(Long id, java.time.LocalDateTime start, java.time.LocalDateTime end, Long locId, String locName) {
        this.shiftId = id; this.startTs = start; this.endTs = end; this.locationId = locId; this.locationName = locName;
    }
}
