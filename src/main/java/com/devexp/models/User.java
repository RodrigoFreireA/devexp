package com.devexp.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "experience_level")
    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "github")
    private String github;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    private String avatar;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", 
        joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private Set<User> followers = new HashSet<>();

    @ManyToMany(mappedBy = "followers")
    private Set<User> following = new HashSet<>();

    @Column(name = "email_resend_count")
    private Integer emailResendCount = 0;

    @Column(name = "last_email_resend")
    private LocalDateTime lastEmailResend;

    @Column(name = "is_email_blocked")
    private Boolean isEmailBlocked = false;

    public enum ExperienceLevel {
        JUNIOR, PLENO, SENIOR
    }

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (roles.isEmpty()) {
            roles.add(Role.ROLE_USER);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Métodos de compatibilidade
    public String getUsername() {
        return email;
    }

    public void setUsername(String username) {
        this.email = username;
    }

    public String getFullName() {
        return name;
    }

    public void setFullName(String fullName) {
        this.name = fullName;
    }

    public String getProfilePicture() {
        return avatar;
    }

    public boolean isAdmin() {
        return roles.contains(Role.ROLE_ADMIN);
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getEmailResendCount() {
        return emailResendCount;
    }

    public void setEmailResendCount(Integer emailResendCount) {
        this.emailResendCount = emailResendCount;
    }

    public LocalDateTime getLastEmailResend() {
        return lastEmailResend;
    }

    public void setLastEmailResend(LocalDateTime lastEmailResend) {
        this.lastEmailResend = lastEmailResend;
    }

    public Boolean getIsEmailBlocked() {
        return isEmailBlocked;
    }

    public void setIsEmailBlocked(Boolean emailBlocked) {
        isEmailBlocked = emailBlocked;
    }

    public void incrementResendCount() {
        this.emailResendCount = (this.emailResendCount == null ? 0 : this.emailResendCount) + 1;
        this.lastEmailResend = LocalDateTime.now();
    }

    public Long getNextResendDelay() {
        if (this.emailResendCount == null || this.emailResendCount == 0) {
            return 0L;
        }

        long delayInMinutes;
        switch (this.emailResendCount) {
            case 1:
                delayInMinutes = 30; // 30 segundos
                break;
            case 2:
                delayInMinutes = 60; // 1 minuto
                break;
            case 3:
                delayInMinutes = 720; // 12 minutos
                break;
            case 4:
                delayInMinutes = 3600; // 1 hora
                break;
            default:
                return -1L; // Bloqueado
        }

        if (this.lastEmailResend == null) {
            return 0L;
        }

        long elapsedTime = ChronoUnit.SECONDS.between(this.lastEmailResend, LocalDateTime.now());
        long remainingTime = (delayInMinutes - elapsedTime) * 1000; // Converter para milissegundos

        return Math.max(0, remainingTime);
    }
}
