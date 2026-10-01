package com.example.buildpro.repository;

import com.example.buildpro.model.OTP;
import com.example.buildpro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByUserAndOtpCodeAndExpiresAtAfter(User user, String otpCode, LocalDateTime now);

    Optional<OTP> findByUserAndPurpose(User user, OTP.Purpose purpose);

    void deleteByExpiresAtBefore(LocalDateTime now);

    void deleteByUser(User user);
}
