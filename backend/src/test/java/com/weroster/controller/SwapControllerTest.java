package com.weroster.controller;

import com.weroster.dto.CreateSwapRequestInput;
import com.weroster.entity.ShiftSwap;
import com.weroster.entity.Staff;
import com.weroster.repository.ShiftSwapRepository;
import com.weroster.repository.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class SwapControllerTest {

    @MockBean
    private ShiftSwapRepository shiftSwapRepository;

    @MockBean
    private StaffRepository staffRepository;

    @Autowired
    private SwapController swapController;

    private CreateSwapRequestInput validSwapRequest;
    private Staff requesterStaff;
    private Staff targetStaff;

    @BeforeEach
    void setUp() {
        requesterStaff = new Staff();
        requesterStaff.setId(1L);
        requesterStaff.setFirstName("John");
        requesterStaff.setLastName("Doe");
        requesterStaff.setStatus("Active"); // Required field
        requesterStaff.setIsManager(false); // Required field
        requesterStaff.setCreatedTime(LocalDateTime.now()); // Required field
        // Note: hospital and designation are required but we'll mock them in tests that need them

        targetStaff = new Staff();
        targetStaff.setId(2L);
        targetStaff.setFirstName("Jane");
        targetStaff.setLastName("Smith");
        targetStaff.setStatus("Active"); // Required field
        targetStaff.setIsManager(false); // Required field
        targetStaff.setCreatedTime(LocalDateTime.now()); // Required field
        // Note: hospital and designation are required but we'll mock them in tests that need them

        validSwapRequest = new CreateSwapRequestInput();
        validSwapRequest.setRequesterId("1");
        validSwapRequest.setTargetUserId("2");
        validSwapRequest.setDate("2024-01-15");
        validSwapRequest.setMessage("Personal reasons");
        validSwapRequest.setCreatedAt("2024-01-15T09:00:00");
    }

    @Test
    void createSwapRequest_WithValidRequest_ShouldReturnSuccess() {
        // Arrange
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));
        ShiftSwap savedSwap = new ShiftSwap();
        savedSwap.setId(1L);
        when(shiftSwapRepository.save(any(ShiftSwap.class))).thenReturn(savedSwap);

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("success"));
        assertEquals(true, responseBody.get("success"));
        
        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftSwapRepository).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithRequesterNotFound_ShouldReturnBadRequest() {
        // Arrange
        when(staffRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Requester not found"));
        
        verify(staffRepository).findById(1L);
        verify(staffRepository, never()).findById(2L);
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithTargetNotFound_ShouldReturnBadRequest() {
        // Arrange
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Target user not found"));
        
        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithSameRequesterAndTarget_ShouldReturnBadRequest() {
        // Arrange
        validSwapRequest.setTargetUserId("1"); // Same as requester

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Cannot swap with yourself"));
        
        verify(staffRepository, never()).findById(anyLong());
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithInvalidDateFormat_ShouldReturnBadRequest() {
        // Arrange
        validSwapRequest.setCreatedAt("invalid-date");
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Text 'invalid-date' could not be parsed"));
        
        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithRepositoryException_ShouldReturnInternalServerError() {
        // Arrange
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));
        when(shiftSwapRepository.save(any(ShiftSwap.class))).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Database error"));
        
        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftSwapRepository).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithNullRequesterId_ShouldReturnBadRequest() {
        // Arrange
        validSwapRequest.setRequesterId(null);

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Requester ID is required"));
        
        verify(staffRepository, never()).findById(anyLong());
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithNullTargetId_ShouldReturnBadRequest() {
        // Arrange
        validSwapRequest.setTargetUserId(null);

        // Act
        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").toString().contains("Target ID is required"));
        
        verify(staffRepository, never()).findById(anyLong());
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
    }
}
