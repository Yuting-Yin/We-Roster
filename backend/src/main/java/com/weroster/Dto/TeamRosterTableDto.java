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
public class TeamRosterTableDto {
    private String hospital;
    private List<String> rooms;
    private List<TeamRosterCellDto> cells;
}
