package main.com.weroster.Dto;

import java.time.LocalDateTime;

public record DayRosterItem(
        long shiftId,
        LocalDateTime startTs,
        LocalDateTime endTs,
        String code,
        String dept,
        String location,
        boolean isLead
) {}
