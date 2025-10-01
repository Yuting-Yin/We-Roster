package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String department;
    private String designation;
    private String status;
    private String name;
    private String accreditation;
    private String phone;
    private String ical;
    private Long staffId; // Add staff ID for matching with team members
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAccreditation() { return accreditation; }
    public void setAccreditation(String accreditation) { this.accreditation = accreditation; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getIcal() { return ical; }
    public void setIcal(String ical) { this.ical = ical; }
}
