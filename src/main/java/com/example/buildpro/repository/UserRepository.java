package com.example.buildpro.repository;

import com.example.buildpro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsVerifiedTrue(String email);

    // Count admins by role
    long countByRole(User.Role role);

    // Count verified admins
    long countByRoleAndIsVerifiedTrue(User.Role role);

    // Find all admins
    List<User> findByRole(User.Role role);

    // Find all verified admins
    List<User> findByRoleAndIsVerifiedTrue(User.Role role);
}
