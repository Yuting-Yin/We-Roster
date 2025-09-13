package main.com.weroster.Dto;

import java.time.LocalDate;
import java.util.List;

public class TeamScheduleDto {
    public Long memberId;
    public LocalDate fromDate;   // inclusive
    public LocalDate toDate;     // inclusive
    public List<TeamScheduleDayDto> days;
}
