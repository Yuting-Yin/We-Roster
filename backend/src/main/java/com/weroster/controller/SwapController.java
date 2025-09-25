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
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
