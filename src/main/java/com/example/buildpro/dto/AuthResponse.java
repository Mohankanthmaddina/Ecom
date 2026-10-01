package com.example.buildpro.dto;

import com.example.buildpro.dto.UserSummaryDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private UserSummaryDTO user;
    private String redirectUrl;
}
