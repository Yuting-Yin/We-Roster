package main.com.weroster.Dto;

import java.time.Instant;
// Comment can be removed
public class LeaveRequestDto {
    private final Long id;
    private final Instant startTime;
    private final Instant endTime;

    public LeaveRequestDto(Long id, Instant startTime, Instant endTime) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public Instant getStartTime() { return startTime; }
    public Instant getEndTime() { return endTime; }
}
