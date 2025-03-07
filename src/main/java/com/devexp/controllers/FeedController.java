package com.devexp.controllers;

import com.devexp.models.User;
import com.devexp.repositories.UserRepository;
import com.devexp.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FeedController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/developers")
    public ResponseEntity<Page<UserDTO>> getDevelopers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> developers;

        if (experienceLevel != null && !experienceLevel.isEmpty()) {
            if (search != null && !search.isEmpty()) {
                developers = userRepository.findByExperienceLevelAndNameContainingIgnoreCase(
                    User.ExperienceLevel.valueOf(experienceLevel.toUpperCase()),
                    search,
                    pageable
                );
            } else {
                developers = userRepository.findByExperienceLevel(
                    User.ExperienceLevel.valueOf(experienceLevel.toUpperCase()),
                    pageable
                );
            }
        } else if (search != null && !search.isEmpty()) {
            developers = userRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            developers = userRepository.findAll(pageable);
        }

        return ResponseEntity.ok(developers.map(this::convertToDTO));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<UserDTO>> getTrendingDevelopers() {
        List<User> trendingUsers = userRepository.findTop5ByOrderByCreatedAtDesc();
        
        List<UserDTO> trendingDTOs = trendingUsers.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(trendingDTOs);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setGithub(user.getGithub());
        dto.setExperienceLevel(user.getExperienceLevel());
        dto.setBio(user.getBio());
        dto.setAvatar(user.getAvatar());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
} 