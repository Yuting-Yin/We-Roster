package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRosterCellDto {
    private String room;
    private String shiftType; // "AM", "PM", "AH", "ON_CALL"
    private List<TeamRosterShiftDto> shifts;
}
