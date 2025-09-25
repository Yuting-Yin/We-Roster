package com.weroster.controller;

import com.weroster.dto.CreateLeaveRequestInput;
import com.weroster.entity.LeaveRequest;
import com.weroster.entity.Staff;
import com.weroster.repository.LeaveRequestRepository;
import com.weroster.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createLeaveRequest(@RequestBody CreateLeaveRequestInput input) {
        try {
            // Find staff by ID
            Staff staff = staffRepository.findById(Long.parseLong(input.getCreatedBy().getId()))
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            
            // Parse dates
            LocalDateTime startTime = LocalDateTime.parse(input.getCreatedAt());
            LocalDateTime endTime = input.getAllDay() ? 
                startTime.plusDays(1) : 
                startTime.plusHours(8); // Default 8-hour shift
            
            // Create leave request
            LeaveRequest leaveRequest = LeaveRequest.builder()
                    .staff(staff)
                    .startTime(startTime)
                    .endTime(endTime)
                    .requestType(input.getRequestType())
                    .reason(input.getReason())
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();
            
            LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
            
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
