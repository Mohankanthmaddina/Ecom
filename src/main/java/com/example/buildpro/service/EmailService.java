package com.example.buildpro.service;

import com.example.buildpro.model.OTP;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async("emailTaskExecutor")
    public void sendOTPEmail(String toEmail, String otpCode, OTP.Purpose purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(getEmailSubject(purpose));
            message.setText(getEmailContent(otpCode, purpose));
            message.setFrom("mohankanthmaddina1784@gmail.com");
            mailSender.send(message);
            System.out.println("Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + " due to SMTP/Authentication error: " + e.getMessage());
            System.out.println("\n==================================================");
            System.out.println("DEVELOPER OTP FALLBACK: OTP for " + toEmail + " is: " + otpCode);
            System.out.println("==================================================\n");
        }
    }

    private String getEmailSubject(OTP.Purpose purpose) {
        switch (purpose) {
            case REGISTRATION:
                return "Verify Your MegaMart Account";
            case PASSWORD_RESET:
                return "Reset Your MegaMart Password";
            default:
                return "MegaMart Notification";
        }
    }

    private String getEmailContent(String otpCode, OTP.Purpose purpose) {
        switch (purpose) {
            case REGISTRATION:
                return "Your OTP for MegaMart registration is: " + otpCode +
                        "\nThis OTP is valid for 10 minutes.";
            case PASSWORD_RESET:
                return "Your OTP for password reset is: " + otpCode +
                        "\nThis OTP is valid for 10 minutes.";
            default:
                return "Your OTP is: " + otpCode;
        }
    }

    @Async("emailTaskExecutor")
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("mohankanthmaddina1784@gmail.com");
            mailSender.send(message);
            System.out.println("Email sent to " + toEmail + " with subject: " + subject);
        } catch (Exception e) {
            System.err.println("Error sending email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
