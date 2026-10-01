-- Fix verification status for existing users
-- This script corrects the verification status for users who were affected by the database default issue

-- Update all users who are not verified but have isVerified = 1 (true) in database
-- These are users who registered but haven't completed email verification
UPDATE users 
SET isVerified = 0 
WHERE isVerified = 1 
AND email NOT IN (
    -- Keep verified status for users who have completed OTP verification
    -- (This would be users who have gone through the proper verification process)
    SELECT DISTINCT u.email 
    FROM users u 
    INNER JOIN otp o ON u.id = o.user_id 
    WHERE o.purpose = 'REGISTRATION' 
    AND o.expires_at < NOW() 
    AND u.isVerified = 1
);

-- Alternative approach: Reset all users to unverified status
-- Uncomment the line below if you want to reset all users to unverified status
-- UPDATE users SET isVerified = 0;

-- Verify the changes
SELECT email, isVerified, role, created_at 
FROM users 
ORDER BY created_at DESC;