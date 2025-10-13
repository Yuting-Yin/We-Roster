package com.weroster.controller;

import com.weroster.dto.CreateSwapRequestInput;
import com.weroster.entity.Shift;
import com.weroster.entity.ShiftSwap;
import com.weroster.entity.Staff;
import com.weroster.entity.User;
import com.weroster.repository.ShiftRepository;
import com.weroster.repository.ShiftSwapRepository;
import com.weroster.repository.StaffRepository;
import com.weroster.repository.UserRepository;
import com.weroster.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/swaps")
@CrossOrigin(origins = "*")
public class SwapController {
    
    @Autowired
    private ShiftSwapRepository shiftSwapRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private ShiftRepository shiftRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Accept an incoming swap request (target user responds)
     */
    @PostMapping("/{swapId}/accept")
    public ResponseEntity<Map<String, Object>> acceptSwapRequest(
            @PathVariable Long swapId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 SwapController - acceptSwapRequest called for swap ID: " + swapId);
            
            // Get current user from auth header
            User currentUser = getCurrentUser(authHeader);
            Staff currentStaff = findStaffByUser(currentUser);
            
            // Find the swap request
            ShiftSwap swapRequest = shiftSwapRepository.findById(swapId)
                    .orElseThrow(() -> new RuntimeException("Swap request not found"));
            
            // Verify this is an incoming swap request for the current user
            if (!swapRequest.getTarget().getId().equals(currentStaff.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied - not your incoming swap request"));
            }
            
            // Check if already responded
            if (!"AWAITING".equals(swapRequest.getStatus())) {
                return ResponseEntity.status(400).body(Map.of("error", "Swap request has already been responded to"));
            }
            
            // Update status to indicate target user accepted (but still needs admin approval)
            swapRequest.setStatus("AWAITING"); // Keep as AWAITING since admin still needs to approve
            swapRequest.setTargetResponse("ACCEPTED");
            swapRequest.setTargetResponseAt(LocalDateTime.now());
            
            ShiftSwap saved = shiftSwapRepository.save(swapRequest);
            
            // Create notification for requester
            notificationService.createSwapAcceptNotification(saved);
            
            System.out.println("🔍 SwapController - Swap request accepted by target user, waiting for admin approval");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Swap request accepted. Waiting for admin approval.",
                "swapId", swapId,
                "status", "AWAITING"
            ));
            
        } catch (Exception e) {
            System.out.println("🔍 SwapController - Error accepting swap request: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Decline an incoming swap request (target user responds)
     */
    @PostMapping("/{swapId}/decline")
    public ResponseEntity<Map<String, Object>> declineSwapRequest(
            @PathVariable Long swapId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 SwapController - declineSwapRequest called for swap ID: " + swapId);
            
            // Get current user from auth header
            User currentUser = getCurrentUser(authHeader);
            Staff currentStaff = findStaffByUser(currentUser);
            
            // Find the swap request
            ShiftSwap swapRequest = shiftSwapRepository.findById(swapId)
                    .orElseThrow(() -> new RuntimeException("Swap request not found"));
            
            // Verify this is an incoming swap request for the current user
            if (!swapRequest.getTarget().getId().equals(currentStaff.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied - not your incoming swap request"));
            }
            
            // Check if already responded
            if (!"AWAITING".equals(swapRequest.getStatus())) {
                return ResponseEntity.status(400).body(Map.of("error", "Swap request has already been responded to"));
            }
            
            // Update status to indicate target user declined
            swapRequest.setStatus("AWAITING"); // Keep as AWAITING since admin still needs to approve
            swapRequest.setTargetResponse("DECLINED");
            swapRequest.setTargetResponseAt(LocalDateTime.now());
            
            ShiftSwap saved = shiftSwapRepository.save(swapRequest);
            
            // Create notification for requester
            notificationService.createSwapDeclineNotification(saved, currentStaff);
            
            System.out.println("🔍 SwapController - Swap request declined by target user");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Swap request declined.",
                "swapId", swapId,
                "status", "DECLINED"
            ));
            
        } catch (Exception e) {
            System.out.println("🔍 SwapController - Error declining swap request: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSwapRequest(@RequestBody CreateSwapRequestInput input) {
        try {
            // Validate input
            if (input.getRequesterId() == null || input.getRequesterId().trim().isEmpty()) {
                throw new RuntimeException("Requester ID is required");
            }
            
            if (input.getTargetUserId() == null || input.getTargetUserId().trim().isEmpty()) {
                throw new RuntimeException("Target ID is required");
            }
            
            if (input.getShiftId() == null || input.getShiftId().trim().isEmpty()) {
                throw new RuntimeException("Shift ID is required");
            }
            
            // Check if requester and target are the same
            if (input.getRequesterId().equals(input.getTargetUserId())) {
                throw new RuntimeException("Cannot swap with yourself");
            }
            
            // Find staff members
            Staff requester = staffRepository.findById(Long.parseLong(input.getRequesterId()))
                    .orElseThrow(() -> new RuntimeException("Requester not found"));
            
            Staff target = staffRepository.findById(Long.parseLong(input.getTargetUserId()))
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
            
            // Fetch shift - now required
            Shift shift = shiftRepository.findById(Long.parseLong(input.getShiftId()))
                    .orElseThrow(() -> new RuntimeException("Shift not found"));
            
            // Use shift's start and end times to ensure consistency
            LocalDateTime fromTime = shift.getStartTs();
            LocalDateTime toTime = shift.getEndTs();
            
            // Check if there's already a pending swap request between these users for the same time
            List<ShiftSwap> existingSwaps = shiftSwapRepository.findByStaffId(requester.getId());
            boolean duplicateExists = existingSwaps.stream()
                .anyMatch(swap -> swap.getTarget().getId().equals(target.getId()) &&
                          swap.getStatus().equals("AWAITING") &&
                          swap.getFromTime().isEqual(fromTime));
            
            if (duplicateExists) {
                throw new RuntimeException("A swap request already exists between you and this user for this time");
            }
            
            // Create swap request
            ShiftSwap swapRequest = ShiftSwap.builder()
                    .requester(requester)
                    .target(target)
                    .shift(shift)
                    .fromTime(fromTime)
                    .toTime(toTime)
                    .message(input.getMessage())
                    .status("AWAITING")
                    .dateMade(LocalDateTime.now())
                    .build();
            
            ShiftSwap saved = shiftSwapRepository.save(swapRequest);
            
            // Create notification for the target staff member
            notificationService.createSwapRequestNotification(saved);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId().toString());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("🔍 Swap Request - Error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            // Check if it's a validation error (user not found, etc.) or a system error (database, etc.)
            if (e.getMessage().contains("not found") || e.getMessage().contains("required") || 
                e.getMessage().contains("Cannot swap") || e.getMessage().contains("could not be parsed") ||
                e.getMessage().contains("already exists")) {
                return ResponseEntity.status(400).body(response);
            } else {
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            System.out.println("🔍 Swap Request - Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
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
