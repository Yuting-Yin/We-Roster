package com.weroster.controller;

import com.weroster.entity.LeaveRequest;
import com.weroster.entity.Staff;
import com.weroster.entity.User;
import com.weroster.repository.LeaveRequestRepository;
import com.weroster.repository.StaffRepository;
import com.weroster.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    /**
     * Get dashboard data including leave requests
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 DashboardController - getDashboardData called");
            
            // Get current user from auth header
            User currentUser = getCurrentUser(authHeader);
            Staff staff = findStaffByUser(currentUser);
            
            System.out.println("🔍 DashboardController - Current staff: " + staff.getFirstName() + " " + staff.getLastName());
            
            // Get leave requests for the current staff
            List<LeaveRequest> leaveRequests = leaveRequestRepository.findByStaffIdOrderByCreatedAtDesc(staff.getId());
            System.out.println("🔍 DashboardController - Found " + leaveRequests.size() + " leave requests");
            
            // Convert leave requests to dashboard format
            List<Map<String, Object>> leaves = leaveRequests.stream()
                .map(this::convertLeaveRequestToDashboardItem)
                .collect(Collectors.toList());
            
            // For now, return empty arrays for other data types
            // TODO: Implement duty, myShifts, and openShifts when needed
            
            Map<String, Object> result = new HashMap<>();
            result.put("duty", new ArrayList<>());
            result.put("myShifts", new ArrayList<>());
            result.put("openShifts", new ArrayList<>());
            result.put("leaves", leaves);
            
            System.out.println("🔍 DashboardController - Returning " + leaves.size() + " leave items");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("🔍 DashboardController - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Convert LeaveRequest entity to dashboard LeaveItem format
     */
    private Map<String, Object> convertLeaveRequestToDashboardItem(LeaveRequest leaveRequest) {
        Map<String, Object> item = new HashMap<>();
        
        item.put("id", leaveRequest.getId());
        
        // Format date
        String date = leaveRequest.getStartTime().toLocalDate().format(DateTimeFormatter.ofPattern("EEE, dd MMM"));
        item.put("date", date);
        
        // Determine leave type based on shift and timing
        String type = determineLeaveType(leaveRequest);
        item.put("type", type);
        
        // Format time category
        String category = formatTimeCategory(leaveRequest);
        item.put("category", category);
        
        // Map status
        String state = mapLeaveStatus(leaveRequest.getStatus());
        item.put("state", state);
        
        // Additional fields
        item.put("requestDate", leaveRequest.getCreatedAt() != null ? leaveRequest.getCreatedAt().toString() : null);
        item.put("startTime", leaveRequest.getStartTime().toString());
        item.put("endTime", leaveRequest.getEndTime().toString());
        item.put("reason", leaveRequest.getReason());
        
        System.out.println("🔍 DashboardController - Converted leave: " + type + " - " + category + " - " + state);
        
        return item;
    }
    
    /**
     * Determine leave type based on shift and timing
     */
    private String determineLeaveType(LeaveRequest leaveRequest) {
        // If it's linked to a shift, it's a shift leave
        if (leaveRequest.getShift() != null) {
            return "Shift Leave";
        }
        
        // Check if it's an overnight leave (starts one day, ends next day)
        LocalDateTime start = leaveRequest.getStartTime();
        LocalDateTime end = leaveRequest.getEndTime();
        
        if (!start.toLocalDate().equals(end.toLocalDate())) {
            return "Shift Leave"; // Overnight leave is a shift leave
        }
        
        // Check if it spans a significant portion of the day
        long durationHours = java.time.Duration.between(start, end).toHours();
        if (durationHours >= 8) {
            return "Day Leave";
        }
        
        return "Day Leave"; // Default fallback
    }
    
    /**
     * Format time category with next-day indicator for overnight shifts
     */
    private String formatTimeCategory(LeaveRequest leaveRequest) {
        LocalDateTime start = leaveRequest.getStartTime();
        LocalDateTime end = leaveRequest.getEndTime();
        
        String startTime = start.format(DateTimeFormatter.ofPattern("HH:mm"));
        String endTime = end.format(DateTimeFormatter.ofPattern("HH:mm"));
        
        // Check if it's overnight (different dates)
        if (!start.toLocalDate().equals(end.toLocalDate())) {
            return startTime + " - " + endTime + " (+1)";
        }
        
        return startTime + " - " + endTime;
    }
    
    /**
     * Map leave request status to dashboard format
     */
    private String mapLeaveStatus(String status) {
        if (status == null) return "Awaiting";
        
        switch (status.toUpperCase()) {
            case "APPROVED":
                return "Approved";
            case "REJECTED":
            case "DECLINED":
                return "Declined";
            case "AWAITING":
            case "PENDING":
                return "Awaiting";
            default:
                return "Awaiting";
        }
    }
    
    /**
     * Helper method to get current user from Authorization header
     */
    private User getCurrentUser(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Missing or invalid authorization header");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            if (!token.startsWith("jwt_token_")) {
                throw new RuntimeException("Invalid token format");
            }
            
            String[] parts = token.split("_");
            if (parts.length < 3) {
                throw new RuntimeException("Invalid token format");
            }
            
            Long userId = Long.parseLong(parts[2]);
            
            return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to find staff by user
     */
    private Staff findStaffByUser(User user) {
        if (user.getStaff() != null) {
            return user.getStaff();
        }
        
        // Fallback: find staff by user ID
        return staffRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Staff not found for user: " + user.getEmail()));
    }
}
