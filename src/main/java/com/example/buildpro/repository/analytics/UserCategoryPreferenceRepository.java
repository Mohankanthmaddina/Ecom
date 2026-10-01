package com.example.buildpro.repository.analytics;

import com.example.buildpro.model.analytics.UserCategoryPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCategoryPreferenceRepository extends JpaRepository<UserCategoryPreference, Long> {

    List<UserCategoryPreference> findByUserId(Long userId);

    Optional<UserCategoryPreference> findFirstByUserIdOrderByCalculatedAtDesc(Long userId);

    List<UserCategoryPreference> findByCategoryId(Long categoryId);
}
