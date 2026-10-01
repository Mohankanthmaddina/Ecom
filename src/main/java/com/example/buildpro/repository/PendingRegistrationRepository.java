package com.example.buildpro.repository;

import com.example.buildpro.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {
    List<PendingRegistration> findByExpiresAtBefore(LocalDateTime now);
}
