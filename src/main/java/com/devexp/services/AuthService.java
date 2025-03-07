package com.devexp.services;

import com.devexp.models.User;
import com.devexp.repositories.UserRepository;
import com.devexp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public String authenticateUser(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            return tokenProvider.generateToken(authentication);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Credenciais inválidas", e);
        }
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email já está em uso!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        user.getRoles().add(User.Role.ROLE_USER);
        
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        
        return savedUser;
    }

    public User updateUser(User user) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(existingUser.getPassword());
        }

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        
        return savedUser;
    }
} 