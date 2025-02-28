package com.devexp.controllers;

import com.devexp.dto.LoginDTO;
import com.devexp.services.AuthServices;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthServices authServices;

    public AuthController(AuthServices authService) {
        this.authServices = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        String token = authServices.authenticate(loginDTO);

        if (token != null) {
            return ResponseEntity.ok().body("Token: " + token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"Credenciais inválidas\"}");
        }
    }
}
