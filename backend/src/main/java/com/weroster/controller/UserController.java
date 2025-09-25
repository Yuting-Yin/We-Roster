package com.weroster.controller;

import com.weroster.dto.ApiUser;
import com.weroster.entity.Staff;
import com.weroster.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private StaffRepository staffRepository;
    
    @GetMapping("/available")
    public ResponseEntity<List<ApiUser>> getAvailableUsers() {
        try {
            List<Staff> activeStaff = staffRepository.findActiveStaff();
            
            List<ApiUser> users = activeStaff.stream()
                    .map(staff -> ApiUser.builder()
                            .id(staff.getId().toString())
                            .displayName(staff.getFirstName() + " " + staff.getLastName())
                            .title(staff.getDesignation() != null ? staff.getDesignation().getName() : null)
                            .avatarUrl(null)
                            .build())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(users);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
