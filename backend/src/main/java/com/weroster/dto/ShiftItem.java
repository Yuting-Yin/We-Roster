package com.weroster.dto;

import java.util.List;

public class ShiftItem {
    private Long id;
    private String startTs;
    private String endTs;
    private String dept;
    private String location;
    private String code;
    private Boolean isLead;
    private Integer coworkers;
    private String role;
    private String note;
    private List<TeammateDto> teammates; // Staff allocated to the same shift
    private String campus; // Hospital campus name
    private String room; // Room name
    private String campusAddress; // Physical address of the campus
    
    public ShiftItem() {}
    
    public ShiftItem(Long id, String startTs, String endTs, String dept, String location, String code, 
                    Boolean isLead, Integer coworkers, String note, List<TeammateDto> teammates, 
                    String campus, String room, String campusAddress) {
        this.id = id;
        this.startTs = startTs;
        this.endTs = endTs;
        this.dept = dept;
        this.location = location;
        this.code = code;
        this.isLead = isLead;
        this.coworkers = coworkers;
        this.role = isLead ? "Lead" : "Staff";
        this.note = note;
        this.teammates = teammates;
        this.campus = campus;
        this.room = room;
        this.campusAddress = campusAddress;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStartTs() { return startTs; }
    public void setStartTs(String startTs) { this.startTs = startTs; }
    
    public String getEndTs() { return endTs; }
    public void setEndTs(String endTs) { this.endTs = endTs; }
    
    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public Boolean getIsLead() { return isLead; }
    public void setIsLead(Boolean isLead) { this.isLead = isLead; }
    
    public Integer getCoworkers() { return coworkers; }
    public void setCoworkers(Integer coworkers) { this.coworkers = coworkers; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    
    public List<TeammateDto> getTeammates() { return teammates; }
    public void setTeammates(List<TeammateDto> teammates) { this.teammates = teammates; }
    
    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }
    
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    
    public String getCampusAddress() { return campusAddress; }
    public void setCampusAddress(String campusAddress) { this.campusAddress = campusAddress; }
}
