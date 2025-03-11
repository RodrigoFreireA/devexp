package com.devexp.controllers;

import com.devexp.models.User;
import com.devexp.models.VerificationToken;
import com.devexp.repositories.UserRepository;
import com.devexp.repositories.VerificationTokenRepository;
import com.devexp.services.EmailService;
import com.devexp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Recebendo requisição de registro: " + request);
            
            // Validações básicas
            if (request.get("email") == null || request.get("email").trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email é obrigatório");
            }
            if (request.get("password") == null || request.get("password").trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Senha é obrigatória");
            }
            if (request.get("name") == null || request.get("name").trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nome é obrigatório");
            }
            if (request.get("experienceLevel") == null || request.get("experienceLevel").trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nível de experiência é obrigatório");
            }

            // Verificar se o email já existe
            if (userRepository.findByEmail(request.get("email")).isPresent()) {
                return ResponseEntity.badRequest().body("Email já está em uso");
            }

            // Criar novo usuário
            User user = new User();
            user.setEmail(request.get("email").trim());
            user.setPassword(passwordEncoder.encode(request.get("password")));
            user.setName(request.get("name").trim());
            user.setGithub(request.get("github") != null ? request.get("github").trim() : "");
            user.setExperienceLevel(User.ExperienceLevel.valueOf(request.get("experienceLevel").toUpperCase()));
            user.setEmailVerified(false);
            
            System.out.println("Salvando usuário: " + user);
            user = userRepository.save(user);

            // Criar token de verificação
            String token = UUID.randomUUID().toString();
            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setUser(user);
            verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            tokenRepository.save(verificationToken);

            // Enviar email de verificação
            emailService.sendVerificationEmail(user.getEmail(), token);

            return ResponseEntity.ok("Usuário registrado com sucesso. Por favor, verifique seu email.");
        } catch (Exception e) {
            System.err.println("Erro ao registrar usuário: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro ao registrar usuário: " + e.getMessage());
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        return tokenRepository.findByToken(token)
                .map(verificationToken -> {
                    if (verificationToken.isUsed()) {
                        return ResponseEntity.badRequest().body("Token já foi usado");
                    }
                    
                    if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                        return ResponseEntity.badRequest().body("Token expirado");
                    }

                    User user = verificationToken.getUser();
                    user.setEmailVerified(true);
                    userRepository.save(user);

                    verificationToken.setUsed(true);
                    tokenRepository.save(verificationToken);

                    return ResponseEntity.ok("Email verificado com sucesso");
                })
                .orElse(ResponseEntity.badRequest().body("Token inválido"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (!user.isEmailVerified()) {
                return ResponseEntity.badRequest().body("Por favor, verifique seu email antes de fazer login");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            String jwt = tokenProvider.generateToken(authentication);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao fazer login: " + e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email é obrigatório");
        }

        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (user.isEmailVerified()) {
                return ResponseEntity.badRequest().body("Email já verificado");
            }

            if (user.getIsEmailBlocked()) {
                return ResponseEntity.status(403)
                    .body(Map.of("blocked", true, "message", "Conta bloqueada por excesso de tentativas"));
            }

            Long nextDelay = user.getNextResendDelay();
            if (nextDelay > 0) {
                return ResponseEntity.status(429)
                    .body(Map.of("nextResendDelay", nextDelay));
            }

            if (user.getEmailResendCount() >= 4) {
                user.setIsEmailBlocked(true);
                userRepository.save(user);
                return ResponseEntity.status(403)
                    .body(Map.of("blocked", true, "message", "Conta bloqueada por excesso de tentativas"));
            }

            // Gera novo token
            String token = UUID.randomUUID().toString();
            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setUser(user);
            verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            
            // Remove tokens antigos e salva o novo
            tokenRepository.deleteAllByUser(user);
            tokenRepository.save(verificationToken);

            // Incrementa contador e salva
            user.incrementResendCount();
            userRepository.save(user);

            // Envia email
            emailService.sendVerificationEmail(user.getEmail(), token);

            return ResponseEntity.ok()
                .body(Map.of("message", "Email de verificação reenviado com sucesso",
                           "nextResendDelay", user.getNextResendDelay()));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Erro ao reenviar email de verificação: " + e.getMessage());
        }
    }
} 