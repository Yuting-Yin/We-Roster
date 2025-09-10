// src/main/java/com/weroster/auth/LoginResponse.java
package com.weroster.Login;

public class LoginResponse {
    private String tokenType;
    private String accessToken;
    private int expiresInSeconds;
    private UserDto user;

    public LoginResponse(String tokenType, String accessToken, int expiresInSeconds, UserDto user) {
        this.tokenType = tokenType;
        this.accessToken = accessToken;
        this.expiresInSeconds = expiresInSeconds;
        this.user = user;
    }
    public String getTokenType() { return tokenType; }
    public String getAccessToken() { return accessToken; }
    public int getExpiresInSeconds() { return expiresInSeconds; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private Long id; private String email; private String role;
        public UserDto(Long id, String email, String role) { this.id = id; this.email = email; this.role = role; }
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }
}
