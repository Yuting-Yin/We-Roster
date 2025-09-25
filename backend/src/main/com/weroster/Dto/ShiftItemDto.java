package main.com.weroster.Dto;

public class ShiftItemDto {
    private Long id;
    private String startTs;
    private String endTs;
    private String dept;
    private String location;
    private String code;
    private boolean isLead;
    private int coworkers;

    public ShiftItemDto() {}
    public ShiftItemDto(Long id, String startTs, String endTs,
                        String dept, String location, String code,
                        boolean isLead, int coworkers) {
        this.id = id; this.startTs = startTs; this.endTs = endTs;
        this.dept = dept; this.location = location; this.code = code;
        this.isLead = isLead; this.coworkers = coworkers;
    }

    public Long getId() { return id; }
    public String getStartTs() { return startTs; }
    public String getEndTs() { return endTs; }
    public String getDept() { return dept; }
    public String getLocation() { return location; }
    public String getCode() { return code; }
    public boolean isLead() { return isLead; }
    public int getCoworkers() { return coworkers; }
}