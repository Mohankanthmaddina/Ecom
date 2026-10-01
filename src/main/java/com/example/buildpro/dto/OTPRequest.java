package com.example.buildpro.dto;


import com.example.buildpro.model.OTP;
import lombok.Data;

@Data
public class OTPRequest {
    private String email;
    private String otpCode;
    private OTP.Purpose purpose;
}
