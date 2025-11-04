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
public class TeamRosterShiftDto {
    private String id;
    private String shiftName;
    private String startTime;
    private String endTime;
    private List<StaffMember> assignedStaff;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffMember {
        private String id;
        private String name;
        private String initials;
        private String designation;
    }
}
