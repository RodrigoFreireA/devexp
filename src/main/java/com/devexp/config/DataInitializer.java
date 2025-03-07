package com.devexp.config;

import com.devexp.models.User;
import com.devexp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Criar usuário admin se não existir
        if (!userRepository.existsByEmail("admin@devexp.com")) {
            User admin = new User();
            admin.setEmail("admin@devexp.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Administrador");
            admin.setBio("Administrador do sistema DevExp");
            admin.setExperienceLevel(User.ExperienceLevel.SENIOR);
            admin.setAvatar("https://ui-avatars.com/api/?name=Administrador");
            admin.getRoles().add(User.Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        // Criar usuário demo se não existir
        if (!userRepository.existsByEmail("demo@devexp.com")) {
            User demo = new User();
            demo.setEmail("demo@devexp.com");
            demo.setPassword(passwordEncoder.encode("demo123"));
            demo.setName("Usuário Demo");
            demo.setBio("Usuário demonstração do sistema DevExp");
            demo.setExperienceLevel(User.ExperienceLevel.JUNIOR);
            demo.setAvatar("https://ui-avatars.com/api/?name=Usuario+Demo");
            // Role ROLE_USER será adicionada automaticamente pelo @PrePersist
            userRepository.save(demo);
        }
    }
} 