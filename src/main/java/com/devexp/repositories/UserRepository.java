package com.devexp.repositories;

import com.devexp.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    
    // Métodos para o feed
    Page<User> findByExperienceLevel(User.ExperienceLevel experienceLevel, Pageable pageable);
    Page<User> findByExperienceLevelAndNameContainingIgnoreCase(User.ExperienceLevel experienceLevel, String name, Pageable pageable);
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<User> findTop5ByOrderByCreatedAtDesc();
}
