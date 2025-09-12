package com.weroster.Dto;

public class TeamSummaryDto {
    public int total;
    public int active;
    public int managers;

    public TeamSummaryDto() {}
    public TeamSummaryDto(int total, int active, int managers) {
        this.total = total; this.active = active; this.managers = managers;
    }
}
