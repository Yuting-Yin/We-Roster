package com.weroster.dto;

public class ShiftItemDto {
    private Long id;
    private String startTs;
    private String endTs;
    private String dept;
    private String location;
    private String code;
    private Boolean isLead;
    private Integer coworkers;
    
    public ShiftItemDto() {}
    
    public ShiftItemDto(Long id, String startTs, String endTs, String dept, String location, String code, Boolean isLead, Integer coworkers) {
        this.id = id;
        this.startTs = startTs;
        this.endTs = endTs;
        this.dept = dept;
        this.location = location;
        this.code = code;
        this.isLead = isLead;
        this.coworkers = coworkers;
    }
    
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
}
