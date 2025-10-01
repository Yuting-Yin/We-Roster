package com.weroster.controller;

import com.weroster.entity.Staff;
import com.weroster.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/team")
@CrossOrigin(origins = "*")
public class TeamController {
    
    @Autowired
    private StaffRepository staffRepository;
    
    /**
     * Get all team members (active staff with user accounts)
     */
    @GetMapping("/members")
    public ResponseEntity<Map<String, Object>> getTeamMembers() {
        try {
            // Get all active staff members
            List<Staff> allStaff = staffRepository.findActiveStaff();
            
            // Convert to DTO format
            List<Map<String, Object>> members = allStaff.stream()
                    .map(staff -> {
                        Map<String, Object> member = new HashMap<>();
                        member.put("id", staff.getId());
                        member.put("firstName", staff.getFirstName());
                        member.put("lastName", staff.getLastName());
                        member.put("name", staff.getFirstName() + " " + staff.getLastName());
                        member.put("email", staff.getEmail());
                        member.put("phone", staff.getPhone());
                        member.put("designation", staff.getDesignation() != null ? staff.getDesignation().getName() : null);
                        member.put("designationCode", staff.getDesignation() != null ? staff.getDesignation().getCode() : null);
                        member.put("accreditation", staff.getAccreditation());
                        member.put("type", staff.getType());
                        member.put("isManager", staff.getIsManager());
                        
                        // Generate initials
                        String initials = (staff.getFirstName().substring(0, 1) + staff.getLastName().substring(0, 1)).toUpperCase();
                        member.put("initials", initials);
                        
                        return member;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("members", members);
            response.put("totalCount", members.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch team members: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

