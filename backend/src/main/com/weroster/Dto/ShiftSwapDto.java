package main.com.weroster.Dto;

import java.time.Instant;

public class ShiftSwapDto {
    private final Long id;
    private final Instant fromTime;
    private final Instant toTime;
    private final Instant dateMade;

    public ShiftSwapDto(Long id, Instant fromTime, Instant toTime, Instant dateMade) {
        this.id = id;
        this.fromTime = fromTime;
        this.toTime = toTime;
        this.dateMade = dateMade;
    }
    public Instant getToTime() { return toTime; }
    public Instant getDateMade() { return dateMade; }
    public Instant getFromTime() { return fromTime; }
    public Long getId() { return id; }
}
