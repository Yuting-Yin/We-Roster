package com.weroster.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUser {
    private String id;
    private String displayName;
    private String title;
    private String avatarUrl;
}
