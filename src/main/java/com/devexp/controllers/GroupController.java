package com.devexp.controllers;

import com.devexp.dto.GroupDTO;
import com.devexp.dto.UserDTO;
import com.devexp.models.Group;
import com.devexp.models.User;
import com.devexp.repositories.GroupRepository;
import com.devexp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<GroupDTO>> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return ResponseEntity.ok(groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable Long id) {
        return groupRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String description = request.get("description");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nome do grupo é obrigatório");
            }

            if (groupRepository.existsByName(name.trim())) {
                return ResponseEntity.badRequest().body("Já existe um grupo com este nome");
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Group group = new Group();
            group.setName(name.trim());
            group.setDescription(description != null ? description.trim() : "");
            group.setCreatedBy(currentUser);

            group = groupRepository.save(group);
            return ResponseEntity.ok(convertToDTO(group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao criar grupo: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Group group = groupRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));

            String name = request.get("name");
            String description = request.get("description");

            if (name != null && !name.trim().isEmpty()) {
                String newName = name.trim();
                if (!newName.equals(group.getName()) && groupRepository.existsByName(newName)) {
                    return ResponseEntity.badRequest().body("Já existe um grupo com este nome");
                }
                group.setName(newName);
            }

            if (description != null) {
                group.setDescription(description.trim());
            }

            group = groupRepository.save(group);
            return ResponseEntity.ok(convertToDTO(group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao atualizar grupo: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            
            Group group = groupRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (group.getMembers().contains(user)) {
                return ResponseEntity.badRequest().body("Usuário já é membro do grupo");
            }

            group.getMembers().add(user);
            group = groupRepository.save(group);
            
            return ResponseEntity.ok(convertToDTO(group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao adicionar membro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            Group group = groupRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (!group.getMembers().contains(user)) {
                return ResponseEntity.badRequest().body("Usuário não é membro do grupo");
            }

            group.getMembers().remove(user);
            group = groupRepository.save(group);
            
            return ResponseEntity.ok(convertToDTO(group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao remover membro: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            Group group = groupRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));

            groupRepository.delete(group);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao deletar grupo: " + e.getMessage());
        }
    }

    private GroupDTO convertToDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setMembersCount(group.getMembers().size());

        // Converter criador
        UserDTO createdByDTO = new UserDTO();
        createdByDTO.setId(group.getCreatedBy().getId());
        createdByDTO.setName(group.getCreatedBy().getName());
        createdByDTO.setAvatar(group.getCreatedBy().getAvatar());
        dto.setCreatedBy(createdByDTO);

        // Converter membros
        Set<UserDTO> memberDTOs = group.getMembers().stream()
                .map(member -> {
                    UserDTO memberDTO = new UserDTO();
                    memberDTO.setId(member.getId());
                    memberDTO.setName(member.getName());
                    memberDTO.setAvatar(member.getAvatar());
                    memberDTO.setExperienceLevel(member.getExperienceLevel());
                    return memberDTO;
                })
                .collect(Collectors.toSet());
        dto.setMembers(memberDTOs);

        return dto;
    }
} 