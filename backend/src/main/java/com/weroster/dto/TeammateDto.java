package com.weroster.dto;

public class TeammateDto {
    private Long staffId;
    private String staffName;
    private String staffInitials;
    private Boolean isLead;
    
    public TeammateDto() {}
    
    public TeammateDto(Long staffId, String staffName, String staffInitials, Boolean isLead) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.staffInitials = staffInitials;
        this.isLead = isLead;
    }
    
    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    
    public String getStaffInitials() { return staffInitials; }
    public void setStaffInitials(String staffInitials) { this.staffInitials = staffInitials; }
    
    public Boolean getIsLead() { return isLead; }
    public void setIsLead(Boolean isLead) { this.isLead = isLead; }
}
