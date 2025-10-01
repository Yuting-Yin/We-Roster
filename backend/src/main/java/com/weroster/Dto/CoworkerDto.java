package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoworkerDto {
    
    private String id;
    private String name;
    private String initials;
    private String designationName;
    private Boolean isLead;
}
