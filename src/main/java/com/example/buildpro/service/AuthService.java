package com.example.buildpro.service;

import com.example.buildpro.model.User;
import com.example.buildpro.model.OTP;
import com.example.buildpro.repository.UserRepository;
import com.example.buildpro.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import java.util.regex.Pattern;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class AuthService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private com.example.buildpro.repository.PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // SecureRandom for better security
    private final java.security.SecureRandom secureRandom = new java.security.SecureRandom();

    // Inner class Removed - using Entity
    // com.example.buildpro.model.PendingRegistration

    /**
     * Strict email format validation
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private boolean isValidEmailFormat(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Store registration data in database and send OTP
     * User is NOT saved to user table until OTP verification
     */
    @Transactional
    public com.example.buildpro.model.PendingRegistration registerUser(User user) {
        // Basic email format validation
        if (!isValidEmailFormat(user.getEmail())) {
            throw new IllegalArgumentException("Invalid email format: " + user.getEmail());
        }

        // Generate OTP
        String otpCode = generateOTP();

        // Encode password
        String encodedPassword = passwordEncoder.encode(user.getPassword());

        // Create pending registration entity
        com.example.buildpro.model.PendingRegistration pendingData = new com.example.buildpro.model.PendingRegistration(
                user.getEmail(),
                encodedPassword,
                user.getName(),
                user.getRole(),
                otpCode,
                LocalDateTime.now().plusMinutes(10));

        // Save to DB (upsert)
        pendingRegistrationRepository.save(pendingData);

        logger.info("=== PENDING REGISTRATION ===");
        logger.info("Email: {}", user.getEmail());
        logger.info("Role: {}", user.getRole());
        logger.info("Status: Awaiting OTP verification");
        logger.info("======================================");

        // Send OTP email
        emailService.sendOTPEmail(user.getEmail(), otpCode, OTP.Purpose.REGISTRATION);

        return pendingData;
    }

    @Transactional
    public boolean verifyOTP(String email, String otpCode, OTP.Purpose purpose) {
        if (purpose == OTP.Purpose.REGISTRATION) {
            // For registration, check DB storage
            Optional<com.example.buildpro.model.PendingRegistration> pendingDataOpt = pendingRegistrationRepository
                    .findById(email);

            if (pendingDataOpt.isEmpty()) {
                logger.warn("No pending registration found for: {}", email);
                return false;
            }

            com.example.buildpro.model.PendingRegistration pendingData = pendingDataOpt.get();

            // Check if OTP matches
            if (!pendingData.getOtpCode().equals(otpCode)) {
                logger.warn("Invalid OTP for: {}", email);
                return false;
            }

            // Check if OTP is expired
            if (pendingData.getExpiresAt().isBefore(LocalDateTime.now())) {
                logger.warn("OTP expired for: {}", email);
                pendingRegistrationRepository.delete(pendingData); // Clean up expired data
                return false;
            }

            // OTP is valid - Create the actual user now
            User newUser = new User();
            newUser.setEmail(pendingData.getEmail());
            newUser.setPassword(pendingData.getEncodedPassword()); // Already encoded
            newUser.setName(pendingData.getName());
            newUser.setRole(pendingData.getRole());

            // SECURITY FEATURE: First admin auto-verified, subsequent admins need approval
            if (pendingData.getRole() == User.Role.ADMIN) {
                long verifiedAdminCount = userRepository.countByRoleAndIsVerifiedTrue(User.Role.ADMIN);

                if (verifiedAdminCount == 0) {
                    // First admin - auto-verify
                    newUser.setIsVerified(true);
                    logger.info("=== FIRST ADMIN ACCOUNT CREATED ===");
                } else {
                    // Subsequent admin - needs approval
                    newUser.setIsVerified(false);
                    logger.info("=== ADMIN ACCOUNT CREATED (REQUIRES APPROVAL) ===");
                }
            } else {
                // Regular user - auto-verify after OTP
                newUser.setIsVerified(true);
                logger.info("=== USER ACCOUNT CREATED ===");
            }

            // Save the user to database
            userRepository.save(newUser);

            // Remove from pending storage
            pendingRegistrationRepository.delete(pendingData);
            logger.info("Removed pending registration for: {}", email);

            return true;

        } else if (purpose == OTP.Purpose.PASSWORD_RESET) {
            // For password reset, check User table with OTP table
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty())
                return false;

            User user = userOpt.get();
            Optional<OTP> otpOpt = otpRepository.findByUserAndOtpCodeAndExpiresAtAfter(
                    user, otpCode, LocalDateTime.now());

            if (otpOpt.isPresent()) {
                logger.info("Password reset OTP verified for: {}", email);
                otpRepository.delete(otpOpt.get());
                return true;
            }
        }

        return false;
    }

    public boolean initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn("User not found for email: {}", email);
            return false;
        }

        User user = userOpt.get();
        if (!user.getIsVerified()) {
            logger.warn("User not verified for email: {}", email);
            return false;
        }
        String otpCode = generateOTP();

        OTP otp = new OTP();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setPurpose(OTP.Purpose.PASSWORD_RESET);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);

        emailService.sendOTPEmail(email, otpCode, OTP.Purpose.PASSWORD_RESET);
        return true;
    }

    public boolean resetPassword(String email, String otpCode, String newPassword) {
        boolean otpVerified = verifyOTP(email, otpCode, OTP.Purpose.PASSWORD_RESET);

        if (otpVerified) {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                logger.info("Password updated successfully for: {}", email);
                return true;
            }
        }
        return false;
    }

    public String generateOTP() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    /**
     * Save OTP to database
     */
    public void saveOTP(OTP otp) {
        otpRepository.save(otp);
    }

    /**
     * Send OTP email
     */
    public void sendOTPEmail(String email, String otpCode, OTP.Purpose purpose) {
        emailService.sendOTPEmail(email, otpCode, purpose);
    }

    /**
     * Get pending registration by email
     */
    public Optional<com.example.buildpro.model.PendingRegistration> getPendingRegistration(String email) {
        return pendingRegistrationRepository.findById(email);
    }

    /**
     * Update pending registration OTP
     */
    @Transactional
    public void updatePendingRegistrationOTP(String email, String newOtpCode) {
        Optional<com.example.buildpro.model.PendingRegistration> dataOpt = pendingRegistrationRepository
                .findById(email);
        if (dataOpt.isPresent()) {
            com.example.buildpro.model.PendingRegistration data = dataOpt.get();
            data.setOtpCode(newOtpCode);
            data.setExpiresAt(LocalDateTime.now().plusMinutes(10));
            pendingRegistrationRepository.save(data);
            logger.info("Updated OTP for: {}", email);
        }
    }

    /**
     * Check if there's a pending registration for email
     */
    public boolean hasPendingRegistration(String email) {
        return pendingRegistrationRepository.existsById(email);
    }

    /**
     * Clean up expired pending registrations (runs every 10 minutes)
     */
    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredPendingRegistrations() {
        LocalDateTime now = LocalDateTime.now();
        List<com.example.buildpro.model.PendingRegistration> expired = pendingRegistrationRepository
                .findByExpiresAtBefore(now);
        if (!expired.isEmpty()) {
            pendingRegistrationRepository.deleteAll(expired);
            logger.info("Cleaned up {} expired pending registrations", expired.size());
        }
    }
}
