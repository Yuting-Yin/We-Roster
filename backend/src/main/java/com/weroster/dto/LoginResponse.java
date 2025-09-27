package com.weroster.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String refreshToken;
    private UserInfo user;
    private String accessToken;
    private String tokenType;
    
    // Constructor for backward compatibility
    public LoginResponse(String token, String tokenType, UserInfo user) {
        this.token = token;
        this.tokenType = tokenType;
        this.user = user;
        this.accessToken = token; // Default accessToken to token
    }
    
    // Standard getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
    
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
}
