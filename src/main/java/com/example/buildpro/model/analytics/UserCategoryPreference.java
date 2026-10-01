package com.example.buildpro.model.analytics;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_category_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCategoryPreference {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "total_quantity", nullable = false)
    private Long totalQuantity;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;
}
