package com.weroster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestsResponseDto {
    private List<RequestCardDto> requests;
    private Integer totalCount;
    private String message;
}
