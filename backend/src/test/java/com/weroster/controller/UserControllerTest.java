package com.weroster.controller;

import com.weroster.dto.ApiUser;
import com.weroster.entity.Designation;
import com.weroster.entity.Staff;
import com.weroster.repository.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class UserControllerTest {

    @MockBean
    private StaffRepository staffRepository;

    @Autowired
    private UserController userController;

    private Staff testStaff1;
    private Staff testStaff2;
    private Designation testDesignation;

    @BeforeEach
    void setUp() {
        testDesignation = new Designation();
        testDesignation.setId(1L);
        testDesignation.setName("Nurse");

        testStaff1 = new Staff();
        testStaff1.setId(1L);
        testStaff1.setFirstName("John");
        testStaff1.setLastName("Doe");
        testStaff1.setDesignation(testDesignation);

        testStaff2 = new Staff();
        testStaff2.setId(2L);
        testStaff2.setFirstName("Jane");
        testStaff2.setLastName("Smith");
        testStaff2.setDesignation(testDesignation);
    }

    @Test
    void getAvailableUsers_WithActiveStaff_ShouldReturnUsers() {
        // Arrange
        List<Staff> activeStaff = Arrays.asList(testStaff1, testStaff2);
        when(staffRepository.findActiveStaff()).thenReturn(activeStaff);

        // Act
        ResponseEntity<List<ApiUser>> response = userController.getAvailableUsers();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        List<ApiUser> users = response.getBody();
        assertNotNull(users);
        assertEquals(2, users.size());
        
        ApiUser user1 = users.get(0);
        assertEquals("1", user1.getId());
        assertEquals("John Doe", user1.getDisplayName());
        assertEquals("Nurse", user1.getTitle());
        assertNull(user1.getAvatarUrl());
        
        ApiUser user2 = users.get(1);
        assertEquals("2", user2.getId());
        assertEquals("Jane Smith", user2.getDisplayName());
        assertEquals("Nurse", user2.getTitle());
        assertNull(user2.getAvatarUrl());
        
        verify(staffRepository).findActiveStaff();
    }

    @Test
    void getAvailableUsers_WithEmptyStaffList_ShouldReturnEmptyList() {
        // Arrange
        when(staffRepository.findActiveStaff()).thenReturn(Arrays.asList());

        // Act
        ResponseEntity<List<ApiUser>> response = userController.getAvailableUsers();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<ApiUser> users = response.getBody();
        assertNotNull(users);
        assertTrue(users.isEmpty());
        
        verify(staffRepository).findActiveStaff();
    }

    @Test
    void getAvailableUsers_WithStaffWithoutDesignation_ShouldReturnUsersWithNullTitle() {
        // Arrange
        testStaff1.setDesignation(null);
        List<Staff> activeStaff = Arrays.asList(testStaff1);
        when(staffRepository.findActiveStaff()).thenReturn(activeStaff);

        // Act
        ResponseEntity<List<ApiUser>> response = userController.getAvailableUsers();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        List<ApiUser> users = response.getBody();
        assertNotNull(users);
        assertEquals(1, users.size());
        
        ApiUser user = users.get(0);
        assertEquals("1", user.getId());
        assertEquals("John Doe", user.getDisplayName());
        assertNull(user.getTitle());
        assertNull(user.getAvatarUrl());
        
        verify(staffRepository).findActiveStaff();
    }

    @Test
    void getAvailableUsers_WithRepositoryException_ShouldReturnInternalServerError() {
        // Arrange
        when(staffRepository.findActiveStaff()).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<List<ApiUser>> response = userController.getAvailableUsers();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
        
        verify(staffRepository).findActiveStaff();
    }
}
