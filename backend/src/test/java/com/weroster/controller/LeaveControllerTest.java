package com.weroster.controller;

import com.weroster.dto.CreateLeaveRequestInput;
import com.weroster.dto.UserInfo;
import com.weroster.entity.LeaveRequest;
import com.weroster.entity.Shift;
import com.weroster.entity.Staff;
import com.weroster.entity.User;
import com.weroster.repository.LeaveRequestRepository;
import com.weroster.repository.ShiftRepository;
import com.weroster.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class LeaveControllerTest {

    @MockBean
    private LeaveRequestRepository leaveRequestRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ShiftRepository shiftRepository;

    @Autowired
    private LeaveController leaveController;

    private User testUser;
    private Staff testStaff;
    private Shift testShift;
    private CreateLeaveRequestInput validLeaveRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRole("USER"); // Required field
        testUser.setSalt("testsalt"); // Set salt to avoid null

        testStaff = new Staff();
        testStaff.setId(1L);
        testStaff.setFirstName("Test");
        testStaff.setLastName("User");
        testStaff.setStatus("Active"); // Required field
        testStaff.setIsManager(false); // Required field
        testStaff.setCreatedTime(LocalDateTime.now()); // Required field
        // Note: hospital and designation are required but we'll mock them in tests that need them
        
        // Link staff to user
        testUser.setStaff(testStaff);
        testStaff.setUser(testUser);

        testShift = new Shift();
        testShift.setId(1L);
        testShift.setStartTs(LocalDateTime.of(2024, 1, 15, 9, 0));
        testShift.setEndTs(LocalDateTime.of(2024, 1, 15, 17, 0));

        validLeaveRequest = new CreateLeaveRequestInput();
        validLeaveRequest.setAllDay(true);
        validLeaveRequest.setDate("2024-01-15");
        validLeaveRequest.setReason("Personal leave");
        UserInfo userInfo = new UserInfo();
        userInfo.setId("1");
        userInfo.setName("Test User");
        userInfo.setEmail("test@example.com");
        validLeaveRequest.setCreatedBy(userInfo);
        validLeaveRequest.setCreatedAt("2024-01-10T10:00:00");
    }

    @Test
    void createLeaveRequest_WithValidAllDayRequest_ShouldReturnSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(leaveRequestRepository.findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        
        LeaveRequest savedLeaveRequest = new LeaveRequest();
        savedLeaveRequest.setId(1L);
        savedLeaveRequest.setStaff(testStaff);
        savedLeaveRequest.setRequestType("All Day Leave");
        savedLeaveRequest.setStatus("PENDING");
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(savedLeaveRequest);

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        verify(userRepository).findById(1L);
        verify(leaveRequestRepository).findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithValidShiftRequest_ShouldReturnSuccess() {
        // Arrange
        validLeaveRequest.setAllDay(false);
        validLeaveRequest.setStart("09:00");
        validLeaveRequest.setEnd("17:00");
        validLeaveRequest.setShiftId("1");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(leaveRequestRepository.findByStaffAndShiftExcludingDeclined(anyLong(), anyLong()))
                .thenReturn(Collections.emptyList());
        when(leaveRequestRepository.findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        LeaveRequest savedLeaveRequest = new LeaveRequest();
        savedLeaveRequest.setId(2L);
        savedLeaveRequest.setStaff(testStaff);
        savedLeaveRequest.setRequestType("Shift Leave");
        savedLeaveRequest.setStatus("PENDING");
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(savedLeaveRequest);

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        verify(userRepository).findById(1L);
        verify(shiftRepository).findById(1L);
        verify(leaveRequestRepository, atLeastOnce()).findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithUserNotFound_ShouldReturnBadRequest() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Object responseBodyObj = response.getBody();
        assertNotNull(responseBodyObj);
        String responseBody = responseBodyObj.toString();
        assertTrue(responseBody.contains("User not found"));
        
        verify(userRepository).findById(1L);
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithShiftNotFound_ShouldReturnBadRequest() {
        // Arrange
        validLeaveRequest.setShiftId("999");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(shiftRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Object responseBodyObj = response.getBody();
        assertNotNull(responseBodyObj);
        String responseBody = responseBodyObj.toString();
        assertTrue(responseBody.contains("Shift not found"));
        
        verify(userRepository).findById(1L);
        verify(shiftRepository).findById(999L);
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithDuplicateAllDayRequest_ShouldReturnConflict() {
        // Arrange
        LeaveRequest existingLeave = new LeaveRequest();
        existingLeave.setId(1L);
        existingLeave.setStartTime(LocalDateTime.of(2024, 1, 15, 0, 0));
        existingLeave.setEndTime(LocalDateTime.of(2024, 1, 15, 23, 59));
        existingLeave.setRequestType("All Day Leave");
        existingLeave.setStatus("PENDING");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(leaveRequestRepository.findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(existingLeave));

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Object responseBodyObj = response.getBody();
        assertNotNull(responseBodyObj);
        String responseBody = responseBodyObj.toString();
        assertTrue(responseBody.contains("duplicate"));
        
        verify(userRepository).findById(1L);
        verify(leaveRequestRepository).findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithShiftConflict_ShouldReturnConflict() {
        // Arrange
        validLeaveRequest.setAllDay(false);
        validLeaveRequest.setStart("09:00");
        validLeaveRequest.setEnd("17:00");
        validLeaveRequest.setShiftId("1");

        LeaveRequest existingLeave = new LeaveRequest();
        existingLeave.setId(1L);
        existingLeave.setStartTime(LocalDateTime.of(2024, 1, 15, 9, 0));
        existingLeave.setEndTime(LocalDateTime.of(2024, 1, 15, 17, 0));
        existingLeave.setRequestType("Shift Leave");
        existingLeave.setStatus("PENDING");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(leaveRequestRepository.findByStaffAndShiftExcludingDeclined(anyLong(), anyLong()))
                .thenReturn(Arrays.asList(existingLeave));
        when(leaveRequestRepository.findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(existingLeave));

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Object responseBodyObj = response.getBody();
        assertNotNull(responseBodyObj);
        String responseBody = responseBodyObj.toString();
        assertTrue(responseBody.contains("duplicate"));
        
        verify(userRepository).findById(1L);
        verify(leaveRequestRepository, atLeastOnce()).findByStaffAndDateRangeExcludingDeclined(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void createLeaveRequest_WithInvalidDateFormat_ShouldReturnBadRequest() {
        // Arrange
        validLeaveRequest.setDate("invalid-date");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        ResponseEntity<?> response = leaveController.createLeaveRequest(validLeaveRequest);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Object responseBodyObj = response.getBody();
        assertNotNull(responseBodyObj);
        String responseBody = responseBodyObj.toString();
        assertTrue(responseBody.contains("Text 'invalid-date' could not be parsed"));
        
        verify(userRepository).findById(1L);
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }
}
