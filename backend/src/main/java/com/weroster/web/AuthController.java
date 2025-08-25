// src/main/java/com/weroster/web/AuthController.java
package com.weroster.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest body) {
    // 先写死一个成功响应，验证前端打通
    if (body.email() == null || body.password() == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "email/password required"));
    }
    return ResponseEntity.ok(Map.of(
      "token", "test-token-123",
      "email", body.email()
    ));
  }

  public record LoginRequest(String email, String password) {}
}
