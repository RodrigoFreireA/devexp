package com.devexp.dto;

import com.devexp.models.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String github;
    private User.ExperienceLevel experienceLevel;
    private String bio;
    private String avatar;
    private String username;
    private String fullName;
    private String profilePicture;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int followersCount;
    private int followingCount;
} 