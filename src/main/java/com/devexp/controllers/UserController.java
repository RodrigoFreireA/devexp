package com.devexp.controllers;

import com.devexp.dto.UserDTO;
import com.devexp.models.User;
import com.devexp.repositories.UserRepository;
import com.devexp.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return userRepository.findById(id)
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setGithub(user.getGithub());
                    dto.setExperienceLevel(user.getExperienceLevel());
                    dto.setBio(user.getBio());
                    dto.setAvatar(user.getAvatar());
                    dto.setCreatedAt(user.getCreatedAt());
                    dto.setFollowersCount(user.getFollowers().size());
                    dto.setFollowingCount(user.getFollowing().size());
                    
                    // Se for admin ou o próprio usuário, retorna dados adicionais
                    boolean isAdmin = currentUser != null && 
                        currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isSameUser = currentUser != null && currentUser.getId().equals(user.getId());
                    
                    if (isAdmin || isSameUser) {
                        dto.setEmail(user.getEmail());
                        dto.setUpdatedAt(user.getUpdatedAt());
                    }
                    
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            // Remove a senha antes de retornar
            user.setPassword(null);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro ao buscar dados do usuário: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // Verifica se o usuário está tentando atualizar seu próprio perfil ou é admin
        if (!id.equals(currentUser.getId()) && !currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Você só pode atualizar seu próprio perfil");
        }

        return userRepository.findById(id)
                .map(user -> {
                    // Atualiza apenas os campos permitidos
                    if (userDetails.getName() != null) {
                        user.setName(userDetails.getName());
                    }
                    if (userDetails.getBio() != null) {
                        user.setBio(userDetails.getBio());
                    }
                    if (userDetails.getGithub() != null) {
                        user.setGithub(userDetails.getGithub());
                    }
                    if (userDetails.getExperienceLevel() != null) {
                        user.setExperienceLevel(userDetails.getExperienceLevel());
                    }
                    
                    // Não permite alteração de email se já existir
                    if (userDetails.getEmail() != null && !user.getEmail().equals(userDetails.getEmail())) {
                        if (userRepository.existsByEmail(userDetails.getEmail())) {
                            throw new RuntimeException("Email já está em uso");
                        }
                        user.setEmail(userDetails.getEmail());
                    }
                    
                    User updatedUser = userRepository.save(user);
                    updatedUser.setPassword(null); // Remove senha antes de retornar
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setBio(user.getBio());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setFollowersCount(user.getFollowers().size());
        dto.setFollowingCount(user.getFollowing().size());
        return dto;
    }
}
