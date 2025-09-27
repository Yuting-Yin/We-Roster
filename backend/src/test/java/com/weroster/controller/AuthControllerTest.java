package com.weroster.controller;

import com.weroster.dto.LoginRequest;
import com.weroster.dto.LoginResponse;
import com.weroster.entity.User;
import com.weroster.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerTest {

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private AuthController authController;

    private User testUser;
    private LoginRequest validLoginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setDomain("test");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("5d41402abc4b2a76b9719d911017c592"); // "hello" in MD5
        testUser.setStatus("ACTIVE");
        testUser.setRole("USER"); // Required field
        testUser.setSalt("testsalt"); // Set salt to avoid null

        validLoginRequest = new LoginRequest();
        validLoginRequest.setDomain("test");
        validLoginRequest.setEmail("test@example.com");
        validLoginRequest.setPassword("hello");
    }

    @Test
    void login_WithValidCredentials_ShouldReturnSuccess() {
        // Arrange
        when(userRepository.findByDomainAndEmail("test", "test@example.com"))
                .thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof LoginResponse);
        
        LoginResponse loginResponse = (LoginResponse) response.getBody();
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getAccessToken());
        assertEquals("Bearer", loginResponse.getTokenType());
        
        verify(userRepository).findByDomainAndEmail("test", "test@example.com");
    }

    @Test
    void login_WithInvalidEmail_ShouldReturnUnauthorized() {
        // Arrange
        when(userRepository.findByDomainAndEmail(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
        
        verify(userRepository).findByDomainAndEmail("test", "test@example.com");
    }

    @Test
    void login_WithInvalidPassword_ShouldReturnUnauthorized() {
        // Arrange
        validLoginRequest.setPassword("wrongpassword");
        when(userRepository.findByDomainAndEmail("test", "test@example.com"))
                .thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
        
        verify(userRepository).findByDomainAndEmail("test", "test@example.com");
    }

    @Test
    void login_WithInactiveUser_ShouldReturnUnauthorized() {
        // Arrange
        testUser.setStatus("INACTIVE");
        when(userRepository.findByDomainAndEmail("test", "test@example.com"))
                .thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Account is not active", response.getBody());
        
        verify(userRepository).findByDomainAndEmail("test", "test@example.com");
    }

    @Test
    void login_WithNullDomain_ShouldReturnUnauthorized() {
        // Arrange
        validLoginRequest.setDomain(null);
        when(userRepository.findByDomainAndEmail(null, "test@example.com"))
                .thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
    }

    @Test
    void login_WithNullEmail_ShouldReturnUnauthorized() {
        // Arrange
        validLoginRequest.setEmail(null);
        when(userRepository.findByDomainAndEmail("test", null))
                .thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = authController.login(validLoginRequest);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody());
    }
}
