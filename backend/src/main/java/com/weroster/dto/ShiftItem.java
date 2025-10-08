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
public class ShiftItem {
    private Long id;
    private String start;
    private String end;
    private String date;
    private String location;
    private String department;
    private String assignedTo;
    private String status;
    private String role;
    private String startTs;
    private String endTs;
    private Boolean isActive;
    private Integer duration;
    private String shiftType;
    private String shiftName;
    private List<TeammateDto> teammates;
    private String description;
    private Boolean isLead;
    private String campus;
    private String campusAddress;
    
    public ShiftItem(Long id, String start, String end, String department, String location, String shiftCode, Boolean isLead, Integer duration, String description, List<TeammateDto> teammates, String campus, String campusAddress, String locationName) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.department = department;
        this.location = location;
        this.shiftType = shiftCode;
        this.isLead = isLead;
        this.duration = duration;
        this.description = description;
        this.teammates = teammates;
        this.campus = campus;
        this.campusAddress = campusAddress;
    }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStartTs() { return startTs; }
    public void setStartTs(String startTs) { this.startTs = startTs; }
    public String getEndTs() { return endTs; }
    public void setEndTs(String endTs) { this.endTs = endTs; }
    public Boolean getIsLead() { return isLead; }
    public void setIsLead(Boolean isLead) { this.isLead = isLead; }
}
