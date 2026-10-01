package com.example.buildpro.exception;

public class OTPExpiredException extends RuntimeException {
    public OTPExpiredException(String message) {
        super(message);
    }
    
    public OTPExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}

