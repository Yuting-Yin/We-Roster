package com.weroster.dto;

public class CoworkerDto {
    private Long staffId;
    private String staffName;
    private String staffInitials;
    
    public CoworkerDto() {}
    
    public CoworkerDto(Long staffId, String staffName, String staffInitials) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.staffInitials = staffInitials;
    }
    
    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    
    public String getStaffInitials() { return staffInitials; }
    public void setStaffInitials(String staffInitials) { this.staffInitials = staffInitials; }
}
