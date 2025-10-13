package com.weroster.controller;

import com.weroster.dto.CreateSwapRequestInput;
import com.weroster.entity.Shift;
import com.weroster.entity.ShiftSwap;
import com.weroster.entity.Staff;
import com.weroster.repository.ShiftRepository;
import com.weroster.repository.ShiftSwapRepository;
import com.weroster.repository.StaffRepository;
import com.weroster.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class SwapControllerTest {

    @MockBean
    private ShiftSwapRepository shiftSwapRepository;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private ShiftRepository shiftRepository;

    @MockBean
    private NotificationService notificationService;

    @Autowired
    private SwapController swapController;

    private CreateSwapRequestInput validSwapRequest;
    private Staff requesterStaff;
    private Staff targetStaff;
    private Shift testShift;

    @BeforeEach
    void setUp() {
        requesterStaff = new Staff();
        requesterStaff.setId(1L);
        requesterStaff.setFirstName("John");
        requesterStaff.setLastName("Doe");
        requesterStaff.setStatus("Active");
        requesterStaff.setIsManager(false);
        requesterStaff.setCreatedTime(LocalDateTime.now());

        targetStaff = new Staff();
        targetStaff.setId(2L);
        targetStaff.setFirstName("Jane");
        targetStaff.setLastName("Smith");
        targetStaff.setStatus("Active");
        targetStaff.setIsManager(false);
        targetStaff.setCreatedTime(LocalDateTime.now());

        testShift = new Shift();
        testShift.setId(1L);
        testShift.setStartTs(LocalDateTime.of(2024, 1, 15, 9, 0));
        testShift.setEndTs(LocalDateTime.of(2024, 1, 15, 17, 0));

        validSwapRequest = new CreateSwapRequestInput();
        validSwapRequest.setRequesterId("1");
        validSwapRequest.setTargetUserId("2");
        validSwapRequest.setShiftId("1");
        validSwapRequest.setDate("2024-01-15");
        validSwapRequest.setMessage("Personal reasons");
        validSwapRequest.setCreatedAt("2024-01-15T09:00:00");
    }

    @Test
    void createSwapRequest_WithValidRequest_ShouldReturnSuccess() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(shiftSwapRepository.findByStaffId(1L)).thenReturn(Collections.emptyList());
        ShiftSwap savedSwap = new ShiftSwap();
        savedSwap.setId(1L);
        when(shiftSwapRepository.save(any(ShiftSwap.class))).thenReturn(savedSwap);
        doNothing().when(notificationService).createSwapRequestNotification(any(ShiftSwap.class));

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(Boolean.TRUE, body.get("success"));
        assertEquals("1", body.get("id"));

        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftRepository).findById(1L);
        verify(shiftSwapRepository).findByStaffId(1L);
        verify(shiftSwapRepository).save(any(ShiftSwap.class));
        verify(notificationService).createSwapRequestNotification(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithRequesterNotFound_ShouldReturnBadRequest() {
        when(staffRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Requester not found"));

        verify(staffRepository).findById(1L);
        verify(staffRepository, never()).findById(2L);
        verifyNoInteractions(shiftRepository, shiftSwapRepository, notificationService);
    }

    @Test
    void createSwapRequest_WithTargetNotFound_ShouldReturnBadRequest() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Target user not found"));

        verify(staffRepository).findById(1L);
        verify(staffRepository).findById(2L);
        verify(shiftRepository, never()).findById(anyLong());
        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    void createSwapRequest_WithSameRequesterAndTarget_ShouldReturnBadRequest() {
        validSwapRequest.setTargetUserId("1");

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Cannot swap with yourself"));

        verifyNoInteractions(staffRepository, shiftRepository, shiftSwapRepository, notificationService);
    }

    @Test
    void createSwapRequest_WithMissingShiftId_ShouldReturnBadRequest() {
        validSwapRequest.setShiftId(null);

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Shift ID is required"));

        verifyNoInteractions(staffRepository, shiftRepository, shiftSwapRepository, notificationService);
    }

    @Test
    void createSwapRequest_WithExistingPendingRequest_ShouldReturnBadRequest() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));

        ShiftSwap existing = new ShiftSwap();
        existing.setRequester(requesterStaff);
        existing.setTarget(targetStaff);
        existing.setFromTime(testShift.getStartTs());
        existing.setStatus("AWAITING");
        when(shiftSwapRepository.findByStaffId(1L)).thenReturn(Collections.singletonList(existing));

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("already exists"));

        verify(shiftSwapRepository, never()).save(any(ShiftSwap.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    void createSwapRequest_WithRepositoryException_ShouldReturnInternalServerError() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(requesterStaff));
        when(staffRepository.findById(2L)).thenReturn(Optional.of(targetStaff));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(testShift));
        when(shiftSwapRepository.findByStaffId(1L)).thenReturn(Collections.emptyList());
        when(shiftSwapRepository.save(any(ShiftSwap.class))).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Database error"));

        verify(notificationService, never()).createSwapRequestNotification(any(ShiftSwap.class));
    }

    @Test
    void createSwapRequest_WithNullRequesterId_ShouldReturnBadRequest() {
        validSwapRequest.setRequesterId(null);

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Requester ID is required"));

        verifyNoInteractions(staffRepository, shiftRepository, shiftSwapRepository, notificationService);
    }

    @Test
    void createSwapRequest_WithNullTargetId_ShouldReturnBadRequest() {
        validSwapRequest.setTargetUserId(null);

        ResponseEntity<Map<String, Object>> response = swapController.createSwapRequest(validSwapRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.get("error").toString().contains("Target ID is required"));

        verifyNoInteractions(staffRepository, shiftRepository, shiftSwapRepository, notificationService);
    }
}
