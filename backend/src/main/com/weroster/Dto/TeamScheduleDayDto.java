package main.com.weroster.Dto;

import java.time.LocalDate;
import java.util.List;

public class TeamScheduleDayDto {
    public LocalDate date;
    public int shiftCount;
    public List<ShiftPreviewDto> shifts;

    public TeamScheduleDayDto() {}
    public TeamScheduleDayDto(LocalDate date, List<ShiftPreviewDto> shifts) {
        this.date = date;
        this.shifts = shifts;
        this.shiftCount = (shifts == null) ? 0 : shifts.size();
    }
}
