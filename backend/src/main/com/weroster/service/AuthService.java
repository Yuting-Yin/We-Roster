package main.com.weroster.service;

import main.com.weroster.Login.AuthException;
import main.com.weroster.Login.LoginResponse;
import main.com.weroster.security.JwtService;
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

        assert user != null;
        ensureStaffLink(user.id, user.email);

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
    private void ensureStaffLink(Long userId, String userEmail) {
        // 1) find existing staff by email
        Long staffId = jdbc.query(
                "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                ps -> ps.setString(1, userEmail),
                rs -> rs.next() ? rs.getLong(1) : null
        );

        // 2) create staff if not found (use any valid hospital_id; pick first)
        if (staffId == null) {
            Long hospitalId = jdbc.query("SELECT id FROM Hospital ORDER BY id ASC LIMIT 1",
                    rs -> rs.next() ? rs.getLong(1) : 1L); // fallback to 1
            jdbc.update(
                    "INSERT INTO staff(hospital_id, first_name, last_name, email, status) VALUES (?,?,?,?, 'Active')",
                    hospitalId, "User", "Account", userEmail
            );
            staffId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        }

        // 3) upsert link
        jdbc.update(
                "INSERT INTO user_staff(user_id, staff_id) VALUES (?, ?) " +
                        "ON DUPLICATE KEY UPDATE staff_id=VALUES(staff_id)",
                userId, staffId
        );
    }
}
