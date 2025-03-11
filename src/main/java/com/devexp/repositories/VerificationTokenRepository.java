package com.devexp.repositories;

import com.devexp.models.User;
import com.devexp.models.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
    
    @Transactional
    void deleteAllByUser(User user);
    
    void deleteByExpiryDateLessThan(LocalDateTime now);
} 