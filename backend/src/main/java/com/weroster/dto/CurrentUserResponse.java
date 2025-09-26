package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String name;
    private String designation;
    private String accreditation;
    private String phone;
    private String ical;
    private String avatarUrl;
    private String role;
    private String status;
}
