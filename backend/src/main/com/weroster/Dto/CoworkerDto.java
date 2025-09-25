package main.com.weroster.Dto;

public class CoworkerDto {
    public Long   staffId;
    public String staffName;
    public String staffInitials;

    public CoworkerDto() {}
    public CoworkerDto(Long staffId, String staffName, String staffInitials) {
        this.staffId = staffId; this.staffName = staffName; this.staffInitials = staffInitials;
    }
}