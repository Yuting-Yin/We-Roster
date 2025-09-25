package com.weroster.controller;

import com.weroster.dto.LoginRequest;
import com.weroster.dto.LoginResponse;
import com.weroster.entity.User;
import com.weroster.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByDomainAndEmail(request.getDomain(), request.getEmail());
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            User user = userOpt.get();
            
            // Verify password using MD5 (matching DataInitializer)
            String hashedPassword = md5(request.getPassword());
            if (!hashedPassword.equals(user.getPasswordHash())) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            if (!"ACTIVE".equals(user.getStatus())) {
                return ResponseEntity.status(401).body("Account is not active");
            }
            
            // Generate JWT token (simplified for now)
            String token = generateJwtToken(user);
            
            LoginResponse response = new LoginResponse(
                    token,
                    "Bearer",
                    null
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }
    
    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    private String generateJwtToken(User user) {
        // Simplified JWT token generation - in production, use proper JWT library
        return "jwt_token_" + user.getId() + "_" + System.currentTimeMillis();
    }
}
