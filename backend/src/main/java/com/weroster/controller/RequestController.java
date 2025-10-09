package com.weroster.controller;

import com.weroster.dto.RequestCardDto;
import com.weroster.dto.RequestsResponseDto;
import com.weroster.entity.*;
import com.weroster.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/requests")
@CrossOrigin(origins = "*")
public class RequestController {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private ShiftSwapRepository shiftSwapRepository;
    
    @Autowired
    private OpenShiftRequestRepository openShiftRequestRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Helper method to find staff linked to a user
     */
    private Staff findStaffByUser(User user) {
        return staffRepository.findAll().stream()
            .filter(staff -> staff.getUser() != null && staff.getUser().getId().equals(user.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No staff linked to user"));
    }
    
    /**
     * Helper method to check if a date falls within the specified month/year
     */
    private boolean isDateInMonthYear(LocalDate date, Integer month, Integer year) {
        if (month == null && year == null) {
            return true; // No filtering
        }
        
        if (year == null) {
            return date.getMonthValue() == month;
        }
        
        if (month == null) {
            return date.getYear() == year;
        }
        
        return date.getMonthValue() == month && date.getYear() == year;
    }
    
    /**
     * Helper method to check if a datetime falls within the specified month/year
     */
    private boolean isDateTimeInMonthYear(LocalDateTime dateTime, Integer month, Integer year) {
        return isDateInMonthYear(dateTime.toLocalDate(), month, year);
    }
    
    /**
     * Helper method to get current user from JWT token (simplified for now)
     * In production, this should properly parse and validate the JWT token
     */
    private User getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("🔍 RequestController - Auth header: " + (authHeader != null ? "Present" : "Missing"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("🔍 RequestController - Missing or invalid authorization header");
            throw new RuntimeException("Missing or invalid authorization header");
        }
        
        // For now, we'll use a simple approach - in production, properly parse JWT
        // Extract token and find user (simplified implementation)
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        System.out.println("🔍 RequestController - Token: " + token);
        
        // For development, we'll assume token format is "jwt_token_{userId}_{timestamp}"
        // In production, you should properly parse the JWT token
        if (token.startsWith("jwt_token_")) {
            String[] parts = token.split("_");
            System.out.println("🔍 RequestController - Token parts: " + java.util.Arrays.toString(parts));
            if (parts.length >= 3) {
                try {
                    Long userId = Long.parseLong(parts[2]);
                    System.out.println("🔍 RequestController - Parsed user ID: " + userId);
                    User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                    System.out.println("🔍 RequestController - Found user: " + user.getEmail());
                    return user;
                } catch (NumberFormatException e) {
                    System.out.println("🔍 RequestController - NumberFormatException: " + e.getMessage());
                    throw new RuntimeException("Invalid token format");
                }
            }
        }
        
        System.out.println("🔍 RequestController - Invalid token format");
        throw new RuntimeException("Invalid token");
    }
    
    /**
     * Get awaiting requests for a user (IN ACTION tab)
     */
    @GetMapping("/awaiting")
    @Transactional(readOnly = true)
    public ResponseEntity<RequestsResponseDto> getAwaitingRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        try {
            System.out.println("🔍 RequestController - getAwaitingRequests called");
            List<RequestCardDto> requests = new ArrayList<>();
            
            // Get current user from JWT token
            User user = getCurrentUser(authHeader);
            Staff staff = findStaffByUser(user);
            System.out.println("🔍 RequestController - Found staff: " + staff.getId());
                
            // Get awaiting leave requests
            List<LeaveRequest> awaitingLeaves = leaveRequestRepository.findByStaffId(staff.getId())
                .stream()
                .filter(lr -> "AWAITING".equals(lr.getStatus()))
                .filter(lr -> isDateTimeInMonthYear(lr.getStartTime(), month, year))
                .collect(Collectors.toList());
            
            for (LeaveRequest leave : awaitingLeaves) {
                requests.add(convertLeaveRequestToCardDto(leave));
            }
            
            // Get awaiting swap requests where user is requester or target
            List<ShiftSwap> awaitingSwaps = shiftSwapRepository.findByStaffId(staff.getId())
                .stream()
                .filter(ss -> "AWAITING".equals(ss.getStatus()))
                .filter(ss -> isDateTimeInMonthYear(ss.getDateMade(), month, year))
                .collect(Collectors.toList());
            
            for (ShiftSwap swap : awaitingSwaps) {
                requests.add(convertShiftSwapToCardDto(swap, staff.getId()));
            }
            
            // Get awaiting open shift requests
            List<OpenShiftRequest> awaitingOpenShiftRequests = openShiftRequestRepository.findByStaffIdAndStatusOrderByCreatedAtDesc(staff.getId(), "AWAITING")
                .stream()
                .filter(osr -> isDateTimeInMonthYear(osr.getCreatedAt(), month, year))
                .collect(Collectors.toList());
            
            for (OpenShiftRequest openShiftRequest : awaitingOpenShiftRequests) {
                requests.add(convertOpenShiftRequestToCardDto(openShiftRequest));
            }
            
            // Sort by creation date (newest first)
            requests.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            
            return ResponseEntity.ok(RequestsResponseDto.builder()
                .requests(requests)
                .totalCount(requests.size())
                .message("Awaiting requests retrieved successfully")
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.status(500).body(RequestsResponseDto.builder()
                .requests(new ArrayList<>())
                .totalCount(0)
                .message("Error retrieving awaiting requests: " + e.getMessage())
                .build());
        }
    }
    
    /**
     * Get history requests for a user (HISTORY tab)
     */
    @GetMapping("/history")
    @Transactional(readOnly = true)
    public ResponseEntity<RequestsResponseDto> getHistoryRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        try {
            List<RequestCardDto> requests = new ArrayList<>();
            
            // Get current user from JWT token
            User user = getCurrentUser(authHeader);
            Staff staff = findStaffByUser(user);
            
            // Get processed leave requests (approved or declined)
            List<LeaveRequest> processedLeaves = leaveRequestRepository.findByStaffId(staff.getId())
                .stream()
                .filter(lr -> !"AWAITING".equals(lr.getStatus()))
                .filter(lr -> isDateTimeInMonthYear(lr.getStartTime(), month, year))
                .collect(Collectors.toList());
            
            for (LeaveRequest leave : processedLeaves) {
                requests.add(convertLeaveRequestToCardDto(leave));
            }
            
            // Get processed swap requests
            List<ShiftSwap> processedSwaps = shiftSwapRepository.findByStaffId(staff.getId())
                .stream()
                .filter(ss -> !"AWAITING".equals(ss.getStatus()))
                .filter(ss -> isDateTimeInMonthYear(ss.getDateMade(), month, year))
                .collect(Collectors.toList());
            
            for (ShiftSwap swap : processedSwaps) {
                requests.add(convertShiftSwapToCardDto(swap, staff.getId()));
            }
            
            // Get processed open shift requests (approved or declined)
            List<OpenShiftRequest> processedOpenShiftRequests = openShiftRequestRepository.findByStaffIdOrderByCreatedAtDesc(staff.getId())
                .stream()
                .filter(osr -> !"AWAITING".equals(osr.getStatus()))
                .filter(osr -> isDateTimeInMonthYear(osr.getCreatedAt(), month, year))
                .collect(Collectors.toList());
            
            for (OpenShiftRequest openShiftRequest : processedOpenShiftRequests) {
                requests.add(convertOpenShiftRequestToCardDto(openShiftRequest));
            }
            
            // Sort by creation date (newest first)
            requests.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            
            return ResponseEntity.ok(RequestsResponseDto.builder()
                .requests(requests)
                .totalCount(requests.size())
                .message("History requests retrieved successfully")
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.status(500).body(RequestsResponseDto.builder()
                .requests(new ArrayList<>())
                .totalCount(0)
                .message("Error retrieving history requests: " + e.getMessage())
                .build());
        }
    }
    
    /**
     * Convert LeaveRequest to RequestCardDto
     */
    private RequestCardDto convertLeaveRequestToCardDto(LeaveRequest leave) {
        String status = mapLeaveStatus(leave.getStatus());
        String requestType = "Leave Request";
        String requestSubType = determineLeaveSubType(leave);
        String date = formatDate(leave.getStartTime().toLocalDate());
        String timeRange = null;
        
        // Add time range if it's a shift-specific leave
        if (leave.getShift() != null) {
            timeRange = formatTimeRange(leave.getStartTime(), leave.getEndTime());
        }
        
        // Safely access nested properties to avoid lazy loading issues
        String shiftId = null;
        String location = null;
        String address = null;
        
        try {
            if (leave.getShift() != null) {
                shiftId = leave.getShift().getId().toString();
                
                // Safely access location
                if (leave.getShift().getLocation() != null) {
                    location = leave.getShift().getLocation().getName();
                    
                    // Safely access hospital address
                    if (leave.getShift().getLocation().getHospital() != null) {
                        address = leave.getShift().getLocation().getHospital().getAddress();
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("🔍 RequestController - Error accessing shift details: " + e.getMessage());
            // Continue with null values for shift details
        }
        
        return RequestCardDto.builder()
            .id(leave.getId().toString())
            .status(status)
            .requestType(requestType)
            .requestSubType(requestSubType)
            .date(date)
            .timeRange(timeRange)
            .isIncomingSwap(false)
            .createdAt(leave.getCreatedAt())
            .reviewedAt(leave.getApprovedAt())
            .reviewedBy(leave.getApprovedBy() != null ? leave.getApprovedBy().getFirstName() + " " + leave.getApprovedBy().getLastName() : null)
            .reason(leave.getReason())
            .shiftId(shiftId)
            .location(location)
            .address(address)
            .build();
    }
    
    /**
     * Convert ShiftSwap to RequestCardDto
     */
    private RequestCardDto convertShiftSwapToCardDto(ShiftSwap swap, Long currentStaffId) {
        String status = mapSwapStatus(swap.getStatus());
        String requestType = "Swap Request";
        String requestSubType;
        boolean isIncomingSwap = false;
        
        // Determine if this is an incoming or outgoing swap request
        if (swap.getRequester().getId().equals(currentStaffId)) {
            requestSubType = "My Swap Request";
        } else {
            requestSubType = "Incoming Swap Request";
            isIncomingSwap = true;
        }
        
        String date = formatDate(swap.getFromTime().toLocalDate());
        String timeRange = formatTimeRange(swap.getFromTime(), swap.getToTime());
        
        // Get shift information from the linked shift
        String shiftId = null;
        String location = null;
        String address = null;
        
        try {
            if (swap.getShift() != null) {
                shiftId = swap.getShift().getId().toString();
                
                // Safely access location
                if (swap.getShift().getLocation() != null) {
                    location = swap.getShift().getLocation().getName();
                    
                    // Safely access hospital address
                    if (swap.getShift().getLocation().getHospital() != null) {
                        address = swap.getShift().getLocation().getHospital().getAddress();
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("🔍 RequestController - Error accessing swap shift details: " + e.getMessage());
            // Continue with null values for shift details
        }
        
        return RequestCardDto.builder()
            .id(swap.getId().toString())
            .status(status)
            .requestType(requestType)
            .requestSubType(requestSubType)
            .date(date)
            .timeRange(timeRange)
            .isIncomingSwap(isIncomingSwap)
            .createdAt(swap.getDateMade())
            .reviewedAt(null) // ShiftSwap doesn't have reviewed date
            .reviewedBy(null)
            .reason(swap.getMessage())
            .shiftId(shiftId)
            .location(location)
            .address(address)
            .build();
    }
    
    /**
     * Convert OpenShiftRequest to RequestCardDto
     */
    private RequestCardDto convertOpenShiftRequestToCardDto(OpenShiftRequest openShiftRequest) {
        String status = mapOpenShiftRequestStatus(openShiftRequest.getStatus());
        String requestType = "Open Shift Request";
        String requestSubType = "Open Shift Request"; // Open shift requests don't have sub-types
        
        // Safely access nested properties to avoid lazy loading issues
        String date = null;
        String timeRange = null;
        String shiftId = null;
        String location = null;
        String address = null;
        
        try {
            if (openShiftRequest.getOpenShift() != null && openShiftRequest.getOpenShift().getShift() != null) {
                Shift shift = openShiftRequest.getOpenShift().getShift();
                date = formatDate(shift.getStartTs().toLocalDate());
                timeRange = formatTimeRange(shift.getStartTs(), shift.getEndTs());
                shiftId = shift.getId().toString(); // Return the actual shift ID, not open shift ID
                
                // Safely access location
                if (shift.getLocation() != null) {
                    location = shift.getLocation().getName();
                    
                    // Safely access hospital address
                    if (shift.getLocation().getHospital() != null) {
                        address = shift.getLocation().getHospital().getAddress();
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("🔍 RequestController - Error accessing open shift details: " + e.getMessage());
            // Continue with null values for shift details
        }
        
        return RequestCardDto.builder()
            .id(openShiftRequest.getId().toString())
            .status(status)
            .requestType(requestType)
            .requestSubType(requestSubType)
            .date(date)
            .timeRange(timeRange)
            .isIncomingSwap(false) // Open shift requests are never incoming swaps
            .createdAt(openShiftRequest.getCreatedAt())
            .reviewedAt(openShiftRequest.getReviewedAt())
            .reviewedBy(openShiftRequest.getReviewedBy() != null ? 
                openShiftRequest.getReviewedBy().getFirstName() + " " + openShiftRequest.getReviewedBy().getLastName() : null)
            .reason(openShiftRequest.getMessage())
            .shiftId(shiftId)
            .location(location)
            .address(address)
            .build();
    }
    
    /**
     * Map leave request status to frontend status
     */
    private String mapLeaveStatus(String backendStatus) {
        switch (backendStatus) {
            case "AWAITING":
                return "AWAITING";
            case "APPROVED":
                return "APPROVED";
            case "DECLINED":
                return "DECLINED";
            default:
                return "AWAITING";
        }
    }
    
    /**
     * Map swap request status to frontend status
     */
    private String mapSwapStatus(String backendStatus) {
        switch (backendStatus) {
            case "AWAITING":
                return "AWAITING";
            case "APPROVED":
                return "APPROVED";
            case "DECLINED":
                return "DECLINED";
            default:
                return "AWAITING";
        }
    }
    
    /**
     * Map open shift request status to frontend status
     */
    private String mapOpenShiftRequestStatus(String backendStatus) {
        switch (backendStatus) {
            case "AWAITING":
                return "AWAITING";
            case "APPROVED":
                return "APPROVED";
            case "DECLINED":
                return "DECLINED";
            case "WITHDRAWN":
                return "DECLINED"; // Map withdrawn to declined for frontend display
            default:
                return "AWAITING";
        }
    }
    
    /**
     * Determine leave request sub-type based on duration and type
     */
    private String determineLeaveSubType(LeaveRequest leave) {
        // Check if it's an overnight leave (starts one day, ends next day)
        LocalDateTime start = leave.getStartTime();
        LocalDateTime end = leave.getEndTime();
        
        if (!start.toLocalDate().equals(end.toLocalDate())) {
            return "Shift Leave"; // Overnight leave is always a shift leave
        }
        
        // If it's linked to a shift, it's a shift leave
        if (leave.getShift() != null) {
            return "Shift Leave";
        }
        
        // Map database request_type values to frontend display values
        if (leave.getRequestType() != null) {
            String requestType = leave.getRequestType().trim();
            
            // Handle exact matches first (new descriptive format)
            switch (requestType) {
                case "Day Leave":
                    return "Day Leave";
                case "Week Leave":
                    return "Week Leave";
                case "Month Leave":
                    return "Month Leave";
                case "Annual Leave":
                    return "Annual Leave";
                case "All Day Leave":
                    return "Day Leave";
                case "Shift Leave":
                    return "Shift Leave";
                default:
                    // Handle legacy abbreviated format
                    switch (requestType.toLowerCase()) {
                        case "day":
                            return "Day Leave";
                        case "week":
                            return "Week Leave";
                        case "month":
                            return "Month Leave";
                        case "annual":
                            return "Annual Leave";
                        default:
                            return "Day Leave";
                    }
            }
        }
        return "Day Leave"; // Default fallback
    }
    
    /**
     * Format date to display format like "Thursday, 15 Oct"
     */
    private String formatDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, d MMM");
        return date.format(formatter);
    }
    
    /**
     * Format time range like "08:00 AM - 13:00 PM"
     */
    private String formatTimeRange(LocalDateTime start, LocalDateTime end) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String startTime = start.format(timeFormatter);
        String endTime = end.format(timeFormatter);
        
        // Check if it's overnight (different dates)
        if (!start.toLocalDate().equals(end.toLocalDate())) {
            return startTime + " - " + endTime + " (+1)";
        }
        
        return startTime + " - " + endTime;
    }
    
    @DeleteMapping("/{requestId}")
    public ResponseEntity<Map<String, Object>> deleteRequest(
            @PathVariable Long requestId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 Delete Request - Request ID: " + requestId);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization header"));
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            User user = getUserFromToken(token);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            
            Staff staff = user.getStaff();
            if (staff == null) {
                return ResponseEntity.status(404).body(Map.of("error", "No staff linked to user"));
            }
            
            System.out.println("🔍 Delete Request - Staff ID: " + staff.getId());
            
            // Try to find and delete the request from different repositories
            boolean deleted = false;
            String requestType = "";
            
            // Try LeaveRequest first
            try {
                LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId).orElse(null);
                if (leaveRequest != null && leaveRequest.getStaff().getId().equals(staff.getId())) {
                    // Check if request can be deleted (only AWAITING status)
                    if (!"AWAITING".equals(leaveRequest.getStatus())) {
                        return ResponseEntity.status(400).body(Map.of(
                            "error", "Cannot delete request with status: " + leaveRequest.getStatus()
                        ));
                    }
                    leaveRequestRepository.deleteById(requestId);
                    deleted = true;
                    requestType = "Leave Request";
                    System.out.println("🔍 Delete Request - Deleted LeaveRequest ID: " + requestId);
                }
            } catch (Exception e) {
                System.out.println("🔍 Delete Request - LeaveRequest not found or error: " + e.getMessage());
            }
            
            // Try ShiftSwap if not found in LeaveRequest
            if (!deleted) {
                try {
                    ShiftSwap shiftSwap = shiftSwapRepository.findById(requestId).orElse(null);
                    if (shiftSwap != null && 
                        (shiftSwap.getRequester().getId().equals(staff.getId()) || 
                         shiftSwap.getTarget().getId().equals(staff.getId()))) {
                        // Check if request can be deleted (only AWAITING status)
                        if (!"AWAITING".equals(shiftSwap.getStatus())) {
                            return ResponseEntity.status(400).body(Map.of(
                                "error", "Cannot delete request with status: " + shiftSwap.getStatus()
                            ));
                        }
                        shiftSwapRepository.deleteById(requestId);
                        deleted = true;
                        requestType = "Swap Request";
                        System.out.println("🔍 Delete Request - Deleted ShiftSwap ID: " + requestId);
                    }
                } catch (Exception e) {
                    System.out.println("🔍 Delete Request - ShiftSwap not found or error: " + e.getMessage());
                }
            }
            
            // Try OpenShiftRequest if not found in previous repositories
            if (!deleted) {
                try {
                    OpenShiftRequest openShiftRequest = openShiftRequestRepository.findById(requestId).orElse(null);
                    if (openShiftRequest != null && openShiftRequest.getStaff().getId().equals(staff.getId())) {
                        // Check if request can be deleted (only AWAITING status)
                        if (!"AWAITING".equals(openShiftRequest.getStatus())) {
                            return ResponseEntity.status(400).body(Map.of(
                                "error", "Cannot delete request with status: " + openShiftRequest.getStatus()
                            ));
                        }
                        openShiftRequestRepository.deleteById(requestId);
                        deleted = true;
                        requestType = "Open Shift Request";
                        System.out.println("🔍 Delete Request - Deleted OpenShiftRequest ID: " + requestId);
                    }
                } catch (Exception e) {
                    System.out.println("🔍 Delete Request - OpenShiftRequest not found or error: " + e.getMessage());
                }
            }
            
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of("error", "Request not found or access denied"));
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", requestType + " deleted successfully",
                "requestId", requestId
            ));
            
        } catch (Exception e) {
            System.out.println("🔍 Delete Request - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete request: " + e.getMessage()));
        }
    }
    
    private User getUserFromToken(String token) {
        try {
            if (!token.startsWith("jwt_token_")) {
                return null;
            }
            String[] parts = token.split("_");
            if (parts.length < 3) {
                return null;
            }
            Long userId = Long.parseLong(parts[2]);
            return userRepository.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
