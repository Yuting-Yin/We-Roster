package com.weroster.controller;

import com.weroster.dto.*;
import com.weroster.entity.*;
import com.weroster.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/openshifts")
@CrossOrigin(origins = "*")
public class OpenShiftController {
    
    @Autowired
    private OpenShiftRepository openShiftRepository;
    
    @Autowired
    private OpenShiftDesignationRequirementsRepository designationRequirementsRepository;
    
    @Autowired
    private OpenShiftRequestRepository openShiftRequestRepository;
    
    @Autowired
    private OpenShiftAssignmentRepository openShiftAssignmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
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
     * Get open shifts for a specific week
     */
    @GetMapping("/week")
    public ResponseEntity<Map<String, Object>> getOpenShiftsForWeek(
            @RequestParam String startDate, // YYYY-MM-DD format
            @RequestParam(required = false) String userEmail) {
        
        try {
            LocalDate weekStart = LocalDate.parse(startDate);
            LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
            LocalDateTime weekEndDateTime = weekStart.plusDays(7).atStartOfDay();
            
            List<OpenShift> openShifts = openShiftRepository.findByDateRange(weekStartDateTime, weekEndDateTime);
            
            // Get current user if provided
            Staff currentStaff = null;
            if (userEmail != null) {
                Optional<User> userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
                if (userOpt.isPresent()) {
                    try {
                        currentStaff = findStaffByUser(userOpt.get());
                    } catch (Exception e) {
                        // User not found or not linked to staff
                        currentStaff = null;
                    }
                }
            }
            
            final Staff finalCurrentStaff = currentStaff;
            List<OpenShiftDto> openShiftDtos = openShifts.stream()
                .map(shift -> convertToDto(shift, finalCurrentStaff))
                .collect(Collectors.toList());
            
            // Group by date
            Map<String, List<OpenShiftDto>> groupedByDate = openShiftDtos.stream()
                .collect(Collectors.groupingBy(OpenShiftDto::getDate));
            
            Map<String, Object> response = new HashMap<>();
            response.put("openShifts", groupedByDate);
            response.put("weekStart", startDate);
            response.put("totalCount", openShiftDtos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch open shifts: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get open shift details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOpenShiftDetails(
            @PathVariable Long id,
            @RequestParam(required = false) String userEmail) {
        
        try {
            Optional<OpenShift> openShiftOpt = openShiftRepository.findById(id);
            if (openShiftOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Open shift not found");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            OpenShift openShift = openShiftOpt.get();
            
            // Get current user if provided
            Staff currentStaff = null;
            if (userEmail != null) {
                Optional<User> userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
                if (userOpt.isPresent()) {
                    try {
                        currentStaff = findStaffByUser(userOpt.get());
                    } catch (Exception e) {
                        // User not found or not linked to staff
                        currentStaff = null;
                    }
                }
            }
            
            final Staff finalCurrentStaff = currentStaff;
            OpenShiftDto openShiftDto = convertToDto(openShift, finalCurrentStaff);
            
            Map<String, Object> response = new HashMap<>();
            response.put("openShift", openShiftDto);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch open shift details: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Apply for an open shift
     */
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyForOpenShift(
            @RequestBody CreateOpenShiftRequestInput input,
            @RequestParam String userEmail) {
        
        try {
            // Find user and staff
            Optional<User> userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
            if (userOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            User user = userOpt.get();
            Staff staff = findStaffByUser(user);
            
            // Find open shift
            Optional<OpenShift> openShiftOpt = openShiftRepository.findById(input.getOpenShiftId());
            if (openShiftOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Open shift not found");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            OpenShift openShift = openShiftOpt.get();
            
            // Validate application
            List<String> validationErrors = validateApplication(staff, openShift);
            if (!validationErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Application validation failed");
                errorResponse.put("details", validationErrors);
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            // Create application
            OpenShiftRequest request = OpenShiftRequest.builder()
                .openShift(openShift)
                .staff(staff)
                .message(input.getMessage())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
            
            request = openShiftRequestRepository.save(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Application submitted successfully");
            response.put("requestId", request.getId());
            response.put("status", "PENDING");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to submit application: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Validate if staff can apply for an open shift
     */
    private List<String> validateApplication(Staff staff, OpenShift openShift) {
        List<String> errors = new ArrayList<>();
        
        // Check if open shift is available (assume all open shifts are available unless assigned)
        // This could be enhanced with additional business logic
        List<OpenShiftAssignment> existingAssignments = openShiftAssignmentRepository
            .findActiveAssignmentsByOpenShift(openShift.getId());
        if (!existingAssignments.isEmpty()) {
            errors.add("Open shift is no longer available");
        }
        
        // Check for duplicate application
        Optional<OpenShiftRequest> existingRequest = openShiftRequestRepository
            .findByOpenShiftAndStaff(openShift.getId(), staff.getId());
        if (existingRequest.isPresent()) {
            errors.add("You have already applied for this open shift");
        }
        
        // Check if already assigned
        Optional<OpenShiftAssignment> existingAssignment = openShiftAssignmentRepository
            .findActiveAssignmentByOpenShiftAndStaff(openShift.getId(), staff.getId());
        if (existingAssignment.isPresent()) {
            errors.add("You are already assigned to this open shift");
        }
        
        // Check designation requirements
        List<OpenShiftDesignationRequirements> requirements = designationRequirementsRepository
            .findByOpenShiftId(openShift.getId());
        
        if (!requirements.isEmpty()) {
            boolean hasRequiredDesignation = requirements.stream()
                .anyMatch(req -> req.getDesignation().getId().equals(staff.getDesignation().getId()));
            
            if (!hasRequiredDesignation) {
                String requiredDesignations = requirements.stream()
                    .map(req -> req.getDesignation().getName())
                    .collect(Collectors.joining(", "));
                errors.add("Your designation does not match the required designations: " + requiredDesignations);
            }
        }
        
        return errors;
    }
    
    /**
     * Convert OpenShift entity to DTO
     */
    private OpenShiftDto convertToDto(OpenShift openShift, Staff currentStaff) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        // Get the shift details
        Shift shift = openShift.getShift();
        
        OpenShiftDto.OpenShiftDtoBuilder builder = OpenShiftDto.builder()
            .id(openShift.getId())
            .startTs(shift.getStartTs())
            .endTs(shift.getEndTs())
            .date(shift.getStartTs().toLocalDate().format(dateFormatter))
            .start(shift.getStartTs().format(timeFormatter))
            .end(shift.getEndTs().format(timeFormatter))
            .session(shift.getType())
            .departmentName(shift.getDepartment() != null ? shift.getDepartment().getName() : null)
            .locationName(shift.getLocation() != null ? shift.getLocation().getName() : null)
            .type(shift.getType())
            .note(shift.getNote())
            .paymentCents(openShift.getExtraPayCents())
            .formattedPayment(openShift.getExtraPayCents() != null ? 
                String.format("$%.2f", openShift.getExtraPayCents() / 100.0) : null)
            .status("OPEN") // OpenShift doesn't have status, using default
            .createdAt(openShift.getDateMade())
            .urgentFlag(openShift.getUrgentFlag())
            .createdByName(null); // OpenShift doesn't have createdBy field
        
        // Get designation requirements
        List<OpenShiftDesignationRequirements> requirements = designationRequirementsRepository
            .findByOpenShiftId(openShift.getId());
        
        List<DesignationRequirementDto> requirementDtos = requirements.stream()
            .map(req -> {
                // Count current assignments for this designation
                List<OpenShiftAssignment> assignments = openShiftAssignmentRepository
                    .findActiveAssignmentsByOpenShift(openShift.getId());
                
                long currentCount = assignments.stream()
                    .filter(assignment -> assignment.getStaff().getDesignation() != null &&
                            assignment.getStaff().getDesignation().getId().equals(req.getDesignation().getId()))
                    .count();
                
                return DesignationRequirementDto.builder()
                    .designationId(req.getDesignation().getId())
                    .designationName(req.getDesignation().getName())
                    .requiredCount(req.getRequiredCount())
                    .currentCount((int) currentCount)
                    .build();
            })
            .collect(Collectors.toList());
        
        builder.designationRequirements(requirementDtos);
        
        // Get assigned staff (coworkers)
        List<OpenShiftAssignment> assignments = openShiftAssignmentRepository
            .findActiveAssignmentsByOpenShift(openShift.getId());
        
        List<CoworkerDto> coworkerDtos = assignments.stream()
            .map(assignment -> {
                Staff staff = assignment.getStaff();
                String initials = (staff.getFirstName().substring(0, 1) + staff.getLastName().substring(0, 1)).toUpperCase();
                
                return CoworkerDto.builder()
                    .id(staff.getId().toString())
                    .name(staff.getFirstName() + " " + staff.getLastName())
                    .initials(initials)
                    .designationName(staff.getDesignation() != null ? staff.getDesignation().getName() : null)
                    .isLead(assignment.getIsLead() != null ? assignment.getIsLead() : false)
                    .build();
            })
            .collect(Collectors.toList());
        
        builder.assignedStaff(coworkerDtos);
        
        // Check if current user can apply
        if (currentStaff != null) {
            List<String> validationErrors = validateApplication(currentStaff, openShift);
            builder.canApply(validationErrors.isEmpty());
            
            // Get application status if exists
            Optional<OpenShiftRequest> existingRequest = openShiftRequestRepository
                .findByOpenShiftAndStaff(openShift.getId(), currentStaff.getId());
            if (existingRequest.isPresent()) {
                builder.applicationStatus(existingRequest.get().getStatus());
            }
        } else {
            builder.canApply(false);
        }
        
        return builder.build();
    }
}
