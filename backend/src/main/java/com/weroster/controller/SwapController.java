package com.weroster.controller;

import com.weroster.dto.CreateSwapRequestInput;
import com.weroster.entity.ShiftSwap;
import com.weroster.entity.Staff;
import com.weroster.repository.ShiftSwapRepository;
import com.weroster.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/swaps")
@CrossOrigin(origins = "*")
public class SwapController {
    
    @Autowired
    private ShiftSwapRepository shiftSwapRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
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
            
            // Parse times
            LocalDateTime fromTime = LocalDateTime.parse(input.getCreatedAt());
            LocalDateTime toTime = fromTime.plusHours(8); // Default 8-hour shift
            
            // Create swap request
            ShiftSwap swapRequest = ShiftSwap.builder()
                    .requester(requester)
                    .target(target)
                    .fromTime(fromTime)
                    .toTime(toTime)
                    .message(input.getMessage())
                    .status("PENDING")
                    .dateMade(LocalDateTime.now())
                    .build();
            
            ShiftSwap saved = shiftSwapRepository.save(swapRequest);
            
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
