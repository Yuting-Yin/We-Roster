// src/main/java/com/weroster/auth/AuthService.java
package com.weroster.auth;

import com.weroster.security.JwtService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    private final JdbcTemplate jdbc;
    private final JwtService jwt;

    public AuthService(JdbcTemplate jdbc, JwtService jwt) { this.jdbc = jdbc; this.jwt = jwt; }

    public LoginResponse login(String email, String password) {
        String sql = "SELECT id, email, password_hash, role, status, salt FROM Users WHERE email = ?";
        UserRow user = jdbc.query(sql, rs -> {
            if (!rs.next()) return null;
            UserRow u = new UserRow();
            u.id = rs.getLong("id");
            u.email = rs.getString("email");
            u.passwordHash = rs.getString("password_hash");
            u.role = rs.getString("role");
            u.status = rs.getString("status");
            u.salt = rs.getString("salt");
            return u;
        }, email);

        if (user == null) throw new AuthException("INVALID_CREDENTIALS");
        if (!"ACTIVE".equalsIgnoreCase(user.status)) throw new AuthException("USER_INACTIVE");

        String salted = (user.salt == null ? "" : user.salt) + password;
        String candidate = md5Hex(salted);
        if (!candidate.equalsIgnoreCase(user.passwordHash)) throw new AuthException("INVALID_CREDENTIALS");

        Map<String,Object> claims = new HashMap<String,Object>();
        claims.put("uid", user.id);
        claims.put("role", user.role);
        String token = jwt.issueAccessToken(user.email, claims);

        return new LoginResponse("Bearer", token, 15 * 60,
                new LoginResponse.UserDto(user.id, user.email, user.role));
    }

    private static String md5Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] dig = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(dig.length * 2);
            for (byte b : dig) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    private static class UserRow {
        Long id; String email; String passwordHash; String role; String status; String salt;
    }
}
