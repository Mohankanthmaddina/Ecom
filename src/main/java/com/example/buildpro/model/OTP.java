package com.example.buildpro.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes")
@Data
public class OTP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String otpCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Purpose purpose;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum Purpose {
        REGISTRATION, PASSWORD_RESET
    }
}
