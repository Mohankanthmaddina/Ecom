package com.example.buildpro.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private String issueType;

    @Column(length = 1000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    private LocalDateTime complaintDate;
    private String adminResponse;

    @PrePersist
    protected void onCreate() {
        complaintDate = LocalDateTime.now();
        if (status == null) {
            status = ComplaintStatus.PENDING;
        }
    }

    public enum ComplaintStatus {
        PENDING, IN_REVIEW, RESOLVED, REJECTED
    }
}
