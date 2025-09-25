// src/main/java/com/weroster/auth/AuthController.java
package com.weroster.Login;

import com.weroster.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest body) {
        return ResponseEntity.ok(auth.login(body.getEmail(), body.getPassword()));
    }

    public static class LoginRequest {
        private String email;
        private String password;
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public String getEmail() { return email; }
        public void setPassword(String password) { this.password = password; }
    }
}
