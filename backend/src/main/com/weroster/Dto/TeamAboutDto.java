package main.com.weroster.Dto;

public class TeamAboutDto {
    public Long id;
    public String firstName;
    public String lastName;
    public String roleTitle;     // designation.name (e.g., "Anaes Coordinator")
    public String avatarInitials;// computed: first letter of first+last
    public String phone;
    public String email;
    public String accreditation; // designation.accreditation (nullable)
}
