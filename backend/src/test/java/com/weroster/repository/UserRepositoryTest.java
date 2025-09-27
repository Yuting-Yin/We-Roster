package com.weroster.repository;

import com.weroster.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByDomainAndEmail_WithExistingUser_ShouldReturnUser() {
        // Arrange
        User user = new User();
        user.setDomain("test");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedpassword");
        user.setStatus("ACTIVE");
        user.setRole("USER");
        
        entityManager.persistAndFlush(user);

        // Act
        Optional<User> found = userRepository.findByDomainAndEmail("test", "test@example.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("test", found.get().getDomain());
        assertEquals("test@example.com", found.get().getEmail());
        assertEquals("ACTIVE", found.get().getStatus());
    }

    @Test
    void findByDomainAndEmail_WithNonExistingUser_ShouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByDomainAndEmail("nonexistent", "notfound@example.com");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void findByDomainAndEmail_WithCaseSensitiveEmail_ShouldReturnEmpty() {
        // Arrange
        User user = new User();
        user.setDomain("test");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedpassword");
        user.setStatus("ACTIVE");
        user.setRole("USER");
        
        entityManager.persistAndFlush(user);

        // Act
        Optional<User> found = userRepository.findByDomainAndEmail("test", "TEST@EXAMPLE.COM");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void findByDomainAndEmail_WithNullDomain_ShouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByDomainAndEmail(null, "test@example.com");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void findByDomainAndEmail_WithNullEmail_ShouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByDomainAndEmail("test", null);

        // Assert
        assertFalse(found.isPresent());
    }
}
