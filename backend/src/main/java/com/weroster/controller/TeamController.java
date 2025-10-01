package com.weroster.controller;

import com.weroster.entity.Staff;
import com.weroster.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
    
    @Autowired
    private com.weroster.repository.ShiftAssignmentRepository shiftAssignmentRepository;
    
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
    
    /**
     * Get shifts for a specific staff member for the calendar view
     * Returns a map of date -> shift types (e.g., "2025-10-01" -> ["AM", "PM"])
     */
    @GetMapping("/members/{staffId}/shifts")
    public ResponseEntity<Map<String, Object>> getStaffShifts(
            @PathVariable Long staffId,
            @RequestParam String startDate,
            @RequestParam(defaultValue = "2") int months) {
        try {
            // Validate staff exists
            Staff staff = staffRepository.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + staffId));
            
            // Parse date range
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDateTime startDateTime = start.atStartOfDay();
            java.time.LocalDateTime endDateTime = startDateTime.plusMonths(months);
            
            // Get all shift assignments for this staff in the date range
            List<com.weroster.entity.ShiftAssignment> assignments = shiftAssignmentRepository
                    .findByStaffAndDateRange(staffId, startDateTime, endDateTime);
            
            // Build shift map: date -> list of shift types
            Map<String, List<String>> shiftMap = new HashMap<>();
            for (com.weroster.entity.ShiftAssignment assignment : assignments) {
                String date = assignment.getShift().getStartTs().toLocalDate().toString();
                String shiftType = assignment.getShift().getType();
                
                shiftMap.computeIfAbsent(date, k -> new ArrayList<>()).add(shiftType);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("staffId", staffId);
            response.put("staffName", staff.getFirstName() + " " + staff.getLastName());
            response.put("shiftMap", shiftMap);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch staff shifts: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

