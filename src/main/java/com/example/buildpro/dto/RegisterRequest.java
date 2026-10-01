package com.example.buildpro.dto;


import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String role;
    private boolean isVerified = true; 
}
