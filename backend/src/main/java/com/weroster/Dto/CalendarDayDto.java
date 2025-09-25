package com.weroster.Dto;

public record CalendarDayDto(
        String date, boolean assignedAM, boolean assignedPM, boolean isToday
) {}