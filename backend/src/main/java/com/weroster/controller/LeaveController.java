package com.weroster.controller;

import com.weroster.dto.CreateLeaveRequestInput;
import com.weroster.entity.LeaveRequest;
import com.weroster.entity.Shift;
import com.weroster.entity.Staff;
import com.weroster.entity.User;
import com.weroster.repository.LeaveRequestRepository;
import com.weroster.repository.ShiftRepository;
import com.weroster.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ShiftRepository shiftRepository;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createLeaveRequest(@RequestBody CreateLeaveRequestInput input) {
        try {
            System.out.println("🔍 Leave Request - Received input: " + input);
            System.out.println("🔍 Leave Request - Shift ID: " + input.getShiftId());
            System.out.println("🔍 Leave Request - User ID: " + input.getCreatedBy().getId());
            System.out.println("🔍 Leave Request - Request Type: " + input.getRequestType());
            System.out.println("🔍 Leave Request - All Day: " + input.getAllDay());
            System.out.println("🔍 Leave Request - Date: " + input.getDate());
            System.out.println("🔍 Leave Request - Start: " + input.getStart());
            System.out.println("🔍 Leave Request - End: " + input.getEnd());
            System.out.println("🔍 Leave Request - Reason: " + input.getReason());
            
            // Find staff by user ID
            User user = userRepository.findById(Long.parseLong(input.getCreatedBy().getId()))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Staff staff = user.getStaff();
            if (staff == null) {
                throw new RuntimeException("No staff linked to user");
            }
            System.out.println("🔍 Leave Request - Found staff: " + staff.getFirstName() + " " + staff.getLastName() + " (ID: " + staff.getId() + ")");
            
            // Check for duplicate leave requests
            System.out.println("🔍 Leave Request - Checking for duplicates...");
            if (input.getShiftId() != null && !input.getShiftId().isEmpty()) {
                Long shiftId = Long.parseLong(input.getShiftId());
                System.out.println("🔍 Leave Request - Checking duplicates for staff ID: " + staff.getId() + ", shift ID: " + shiftId);
                
                // First check for exact shift duplicates
                List<LeaveRequest> existingRequests = leaveRequestRepository.findByStaffAndShift(staff.getId(), shiftId);
                System.out.println("🔍 Leave Request - Found " + existingRequests.size() + " existing requests for this staff/shift combination");
                
                if (!existingRequests.isEmpty()) {
                    System.out.println("🔍 Leave Request - DUPLICATE DETECTED! " + existingRequests.size() + " existing requests for shift " + shiftId);
                    for (LeaveRequest existing : existingRequests) {
                        System.out.println("🔍 Leave Request - Existing request ID: " + existing.getId() + ", Status: " + existing.getStatus() + ", Created: " + existing.getCreatedAt());
                    }
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "A leave request for this shift already exists");
                    response.put("duplicate", true);
                    System.out.println("🔍 Leave Request - Returning 200 OK with duplicate flag");
                    return ResponseEntity.ok(response); // 200 OK with duplicate flag
                }
                
                // Then check for same-day conflicts (all-day leave on the same day)
                LocalDate requestDate = LocalDate.parse(input.getDate());
                System.out.println("🔍 Leave Request - Checking for same-day conflicts on: " + requestDate);
                
                List<LeaveRequest> sameDayRequests = leaveRequestRepository.findByStaffAndDateRange(
                    staff.getId(), 
                    requestDate.atStartOfDay(), 
                    requestDate.atTime(23, 59, 59)
                );
                
                System.out.println("🔍 Leave Request - Found " + sameDayRequests.size() + " existing requests for the same day");
                
                if (!sameDayRequests.isEmpty()) {
                    System.out.println("🔍 Leave Request - SAME-DAY CONFLICT DETECTED!");
                    for (LeaveRequest existing : sameDayRequests) {
                        System.out.println("🔍 Leave Request - Existing request ID: " + existing.getId() + 
                            ", Type: " + existing.getRequestType() + 
                            ", Status: " + existing.getStatus() + 
                            ", Date: " + existing.getStartTime().toLocalDate());
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "You already have a leave request for this day. Please check your existing requests.");
                    response.put("duplicate", true);
                    System.out.println("🔍 Leave Request - Returning 200 OK with same-day conflict flag");
                    return ResponseEntity.ok(response); // 200 OK with duplicate flag
                } else {
                    System.out.println("🔍 Leave Request - No same-day conflicts found, proceeding with creation");
                }
            } else {
                System.out.println("🔍 Leave Request - No shift ID provided, checking for same-day conflicts...");
                
                // Check for same-day conflicts between All Day Leave and Shift Leave
                LocalDate requestDate = LocalDate.parse(input.getDate());
                System.out.println("🔍 Leave Request - Checking for same-day conflicts on: " + requestDate);
                
                List<LeaveRequest> sameDayRequests = leaveRequestRepository.findByStaffAndDateRange(
                    staff.getId(), 
                    requestDate.atStartOfDay(), 
                    requestDate.atTime(23, 59, 59)
                );
                
                System.out.println("🔍 Leave Request - Found " + sameDayRequests.size() + " existing requests for the same day");
                
                if (!sameDayRequests.isEmpty()) {
                    System.out.println("🔍 Leave Request - SAME-DAY CONFLICT DETECTED!");
                    for (LeaveRequest existing : sameDayRequests) {
                        System.out.println("🔍 Leave Request - Existing request ID: " + existing.getId() + 
                            ", Type: " + existing.getRequestType() + 
                            ", Status: " + existing.getStatus() + 
                            ", Date: " + existing.getStartTime().toLocalDate());
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "You already have a leave request for this day. Please check your existing requests.");
                    response.put("duplicate", true);
                    System.out.println("🔍 Leave Request - Returning 200 OK with same-day conflict flag");
                    return ResponseEntity.ok(response); // 200 OK with duplicate flag
                } else {
                    System.out.println("🔍 Leave Request - No same-day conflicts found, proceeding with creation");
                }
            }
            
            // Find shift by ID if provided (for Day Leave requests)
            Shift shift = null;
            if (input.getShiftId() != null && !input.getShiftId().isEmpty()) {
                shift = shiftRepository.findById(Long.parseLong(input.getShiftId()))
                        .orElseThrow(() -> new RuntimeException("Shift not found"));
                System.out.println("🔍 Leave Request - Found shift: " + shift.getId() + " (" + shift.getStartTs() + " - " + shift.getEndTs() + ")");
            } else {
                System.out.println("🔍 Leave Request - No shift ID provided (not a Day Leave request)");
            }
            
            // Parse dates - use shift times if available, otherwise use input times
            LocalDateTime startTime, endTime;
            if (shift != null) {
                // Use shift's actual start and end times
                startTime = shift.getStartTs();
                endTime = shift.getEndTs();
                System.out.println("🔍 Leave Request - Using shift times: " + startTime + " to " + endTime);
            } else {
                // Parse from input (for other leave types)
                startTime = LocalDateTime.parse(input.getDate() + "T" + (input.getStart() != null ? input.getStart() : "00:00") + ":00");
                endTime = input.getAllDay() ? 
                    startTime.plusDays(1) : 
                    LocalDateTime.parse(input.getDate() + "T" + (input.getEnd() != null ? input.getEnd() : "23:59") + ":00");
                System.out.println("🔍 Leave Request - Using input times: " + startTime + " to " + endTime);
            }
            
            // Create leave request
            LeaveRequest leaveRequest = LeaveRequest.builder()
                    .staff(staff)
                    .shift(shift) // Link to specific shift for Shift Leave (null for All Day Leave)
                    .startTime(startTime)
                    .endTime(endTime)
                    .requestType(input.getRequestType() != null ? input.getRequestType() : (input.getAllDay() ? "All Day Leave" : "Shift Leave"))
                    .reason(input.getReason())
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();
            
            System.out.println("🔍 Leave Request - About to save leave request to database...");
            LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
            System.out.println("🔍 Leave Request - SUCCESS! Saved leave request with ID: " + saved.getId());
            System.out.println("🔍 Leave Request - Staff ID: " + saved.getStaff().getId());
            System.out.println("🔍 Leave Request - Shift ID: " + (saved.getShift() != null ? saved.getShift().getId() : "null"));
            System.out.println("🔍 Leave Request - Request Type: " + saved.getRequestType());
            System.out.println("🔍 Leave Request - Status: " + saved.getStatus());
            System.out.println("🔍 Leave Request - Start Time: " + saved.getStartTime());
            System.out.println("🔍 Leave Request - End Time: " + saved.getEndTime());
            System.out.println("🔍 Leave Request - Created At: " + saved.getCreatedAt());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId().toString());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("🔍 Leave Request - Error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            System.out.println("🔍 Leave Request - Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/my-leaves")
    public ResponseEntity<?> getMyLeaves(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "month", required = false) String month) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid authorization header");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body("Invalid token");
            }
            
            Staff staff = user.getStaff();
            if (staff == null) {
                return ResponseEntity.status(404).body("No staff linked to user");
            }
            
            // Parse month parameter or use current month
            YearMonth targetMonth;
            if (month != null && !month.isEmpty()) {
                targetMonth = YearMonth.parse(month); // Expected format: YYYY-MM
            } else {
                targetMonth = YearMonth.now();
            }
            
            // Get start and end of the month
            LocalDateTime monthStart = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = targetMonth.atEndOfMonth().atTime(23, 59, 59);
            
            System.out.println("🔍 My Leaves - Staff ID: " + staff.getId());
            System.out.println("🔍 My Leaves - Month: " + targetMonth);
            System.out.println("🔍 My Leaves - Date range: " + monthStart + " to " + monthEnd);
            
            // Find leave requests for the staff where the leave occurs in the specified month
            // Use startTime/endTime instead of createdAt to show leaves that actually happen this month
            System.out.println("🔍 My Leaves - Querying database for leave requests...");
            List<LeaveRequest> leaveRequests = leaveRequestRepository.findByStaffAndDateRange(
                staff.getId(), monthStart, monthEnd);
            
            System.out.println("🔍 My Leaves - Found " + leaveRequests.size() + " leave requests");
            for (LeaveRequest leave : leaveRequests) {
                System.out.println("🔍 My Leaves - Request ID: " + leave.getId() + 
                    ", Type: " + leave.getRequestType() + 
                    ", Status: " + leave.getStatus() + 
                    ", Created: " + leave.getCreatedAt() +
                    ", Shift ID: " + (leave.getShift() != null ? leave.getShift().getId() : "null"));
            }
            
            // Convert to response format
            List<Map<String, Object>> response = leaveRequests.stream()
                .map(leave -> {
                    Map<String, Object> leaveMap = new HashMap<>();
                    leaveMap.put("id", leave.getId());
                    leaveMap.put("requestDate", leave.getCreatedAt());
                    leaveMap.put("startTime", leave.getStartTime());
                    leaveMap.put("endTime", leave.getEndTime());
                    leaveMap.put("leaveType", leave.getRequestType());
                    leaveMap.put("status", leave.getStatus());
                    leaveMap.put("reason", leave.getReason());
                    leaveMap.put("shiftId", leave.getShift() != null ? leave.getShift().getId() : null);
                    return leaveMap;
                })
                .toList();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("🔍 My Leaves - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to get leave requests: " + e.getMessage());
        }
    }
    
    private User getUserFromToken(String token) {
        try {
            if (!token.startsWith("jwt_token_")) { return null; }
            String[] parts = token.split("_");
            if (parts.length < 3) { return null; }
            Long userId = Long.parseLong(parts[2]);
            return userRepository.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
