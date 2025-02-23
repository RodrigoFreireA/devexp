package com.devexp.services;

import com.devexp.dto.LoginDTO;
import com.devexp.models.User;
import com.devexp.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServices {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServices(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean authenticate(LoginDTO loginDTO) {
        Optional<User> userOpt = userRepository.findByEmail(loginDTO.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return passwordEncoder.matches(loginDTO.getPassword(), user.getPassword());
        }
        return false;
    }
}

