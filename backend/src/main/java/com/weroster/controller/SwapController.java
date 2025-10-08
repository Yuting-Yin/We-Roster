package com.weroster.controller;

import com.weroster.dto.CreateSwapRequestInput;
import com.weroster.entity.ShiftSwap;
import com.weroster.entity.Staff;
import com.weroster.repository.ShiftSwapRepository;
import com.weroster.repository.StaffRepository;
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
    private NotificationService notificationService;
    
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
            
            // Check if requester and target are the same
            if (input.getRequesterId().equals(input.getTargetUserId())) {
                throw new RuntimeException("Cannot swap with yourself");
            }
            
            // Find staff members
            Staff requester = staffRepository.findById(Long.parseLong(input.getRequesterId()))
                    .orElseThrow(() -> new RuntimeException("Requester not found"));
            
            Staff target = staffRepository.findById(Long.parseLong(input.getTargetUserId()))
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
            
            // Check for existing swap request between these two users for the same time
            // Parse the actual shift date and time, not the creation time
            LocalDateTime fromTime = LocalDateTime.parse(input.getDate() + "T" + input.getStart());
            LocalDateTime toTime = LocalDateTime.parse(input.getDate() + "T" + input.getEnd());
            
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
                e.getMessage().contains("Cannot swap") || e.getMessage().contains("could not be parsed")) {
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
}
