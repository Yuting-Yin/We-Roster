package main.com.weroster.Dto;
import java.util.List;

public class OpenShiftCompareDto {
    public List<OpenShiftDetailDto> newShifts;       // in window B, not in A
    public List<OpenShiftDetailDto> removedShifts;   // in window A, not in B
    public List<OpenShiftDetailDto> unchangedShifts; // in both

    public OpenShiftCompareDto() {}

    public OpenShiftCompareDto(List<OpenShiftDetailDto> newShifts,
                               List<OpenShiftDetailDto> removedShifts,
                               List<OpenShiftDetailDto> unchangedShifts) {
        this.newShifts = newShifts;
        this.removedShifts = removedShifts;
        this.unchangedShifts = unchangedShifts;
    }
}
