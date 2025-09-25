package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "domain", nullable = false, length = 100)
    private String domain;
    
    @Column(name = "role", nullable = false, length = 32)
    private String role;
    
    @Column(name = "email", nullable = false, length = 320)
    private String email;
    
    @Column(name = "salt", length = 255)
    private String salt;
    
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(name = "status", nullable = false, length = 30)
    private String status;
    
    @Column(name = "created_time")
    private LocalDateTime createdTime;
    
    @Column(name = "status_time")
    private LocalDateTime statusTime;
    
    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;
    
    @Column(name = "login_attempts", nullable = false)
    @Builder.Default
    private Integer loginAttempts = 0;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserStaff userStaff;
}
