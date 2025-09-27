package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeammateDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
    private Boolean isActive;
    
    public TeammateDto(Long id, String firstName, String lastName, Boolean isActive) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isActive = isActive;
    }
}
