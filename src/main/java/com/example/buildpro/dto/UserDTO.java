package com.example.buildpro.dto;

import com.example.buildpro.model.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private User.Role role;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdAtDisplay;
    private String updatedAtDisplay;
    private String roleDisplay;
    private String statusDisplay;
}
