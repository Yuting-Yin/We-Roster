package com.weroster.controller;

import com.weroster.dto.CurrentUserResponse;
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
            System.out.println("🔍 AuthController - Login request received: " + request.getDomain() + "/" + request.getEmail());
            
            Optional<User> userOpt = userRepository.findByDomainAndEmail(request.getDomain(), request.getEmail());
            System.out.println("🔍 AuthController - User found: " + userOpt.isPresent());
            
            if (userOpt.isEmpty()) {
                System.out.println("🔍 AuthController - User not found, returning 401");
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            User user = userOpt.get();
            System.out.println("🔍 AuthController - User status: " + user.getStatus());
            
            // Verify password using MD5 (matching DataInitializer)
            String hashedPassword = md5(request.getPassword());
            System.out.println("🔍 AuthController - Password hash match: " + hashedPassword.equals(user.getPasswordHash()));
            
            if (!hashedPassword.equals(user.getPasswordHash())) {
                System.out.println("🔍 AuthController - Password mismatch, returning 401");
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            if (!"ACTIVE".equals(user.getStatus())) {
                System.out.println("🔍 AuthController - User not active, returning 401");
                return ResponseEntity.status(401).body("Account is not active");
            }
            
            // Generate JWT token (simplified for now)
            String token = generateJwtToken(user);
            System.out.println("🔍 AuthController - Token generated, returning success");
            
            LoginResponse response = new LoginResponse(
                    token,
                    "Bearer",
                    null
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("🔍 AuthController - Exception: " + e.getMessage());
            e.printStackTrace();
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
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid authorization header");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            User user = getUserFromToken(token);
            
            if (user == null) {
                return ResponseEntity.status(401).body("Invalid token");
            }
            
            CurrentUserResponse response = buildCurrentUserResponse(user);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get current user: " + e.getMessage());
        }
    }
    
    private User getUserFromToken(String token) {
        try {
            // Simplified token parsing - in production, use proper JWT library
            if (!token.startsWith("jwt_token_")) {
                return null;
            }
            
            String[] parts = token.split("_");
            if (parts.length < 3) {
                return null;
            }
            
            Long userId = Long.parseLong(parts[2]);
            Optional<User> userOpt = userRepository.findById(userId);
            return userOpt.orElse(null);
            
        } catch (Exception e) {
            return null;
        }
    }
    
    private CurrentUserResponse buildCurrentUserResponse(User user) {
        CurrentUserResponse.CurrentUserResponseBuilder builder = CurrentUserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus());
        
        // Get staff information if available
        if (user.getStaff() != null) {
            var staff = user.getStaff();
            builder.firstName(staff.getFirstName())
                   .lastName(staff.getLastName())
                   .name(staff.getFirstName() + " " + staff.getLastName())
                   .phone(staff.getPhone())
                   .ical(null); // Staff entity doesn't have icalUrl field
            
            if (staff.getDesignation() != null) {
                builder.designation(staff.getDesignation().getName());
            }
            
            // Staff entity doesn't have accreditation field
            builder.accreditation(null);
        }
        
        return builder.build();
    }
}
