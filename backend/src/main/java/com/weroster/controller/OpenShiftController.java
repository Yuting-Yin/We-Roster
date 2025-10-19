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
    private ShiftDesignationRequirementsRepository designationRequirementsRepository;
    
    @Autowired
    private OpenShiftRequestRepository openShiftRequestRepository;
    
    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;
    
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
     * Check if open shift requirements are satisfied and update status
     * AVAILABLE → READY_TO_RUN when requirements are met
     * 
     * Three scenarios:
     * 1. No designation requirements: Check total APPROVED requests >= totalStaffNeeded
     * 2. Has designation requirements: Check each designation requirement is met by APPROVED requests
     * 3. Mixed: Check designation requirements AND total count
     * 
     * Note: Only APPROVED requests count (not PENDING)
     * Since we don't have admin interface, requests stay PENDING, so status won't auto-update in practice
     */
    private void checkAndUpdateOpenShiftStatus(OpenShift openShift) {
        // Only update if currently AVAILABLE or READY_TO_RUN
        if ("CANCELLED".equals(openShift.getStatus()) || "APPROVED_FOR_FORMAL".equals(openShift.getStatus())) {
            return; // Don't modify cancelled or approved shifts
        }
        
        // Get designation requirements from the associated shift
        List<ShiftDesignationRequirements> designationReqs = designationRequirementsRepository
            .findByShiftId(openShift.getShift().getId());
        
        // Get APPROVED requests (not assignments - assignments come after admin approval)
        List<OpenShiftRequest> approvedRequests = openShiftRequestRepository
            .findByOpenShiftIdOrderByCreatedAtDesc(openShift.getId()).stream()
            .filter(req -> "APPROVED".equals(req.getStatus()))
            .collect(java.util.stream.Collectors.toList());
        
        boolean requirementsMet = false;
        
        if (designationReqs.isEmpty()) {
            // Scenario 1: No designation requirements, just check total count
            requirementsMet = approvedRequests.size() >= openShift.getTotalStaffNeeded();
        } else {
            // Scenario 2 & 3: Has designation requirements
            // Check each designation requirement is satisfied
            boolean allDesignationsMet = designationReqs.stream().allMatch(req -> {
                long approvedCount = approvedRequests.stream()
                    .filter(request -> request.getStaff().getDesignation() != null &&
                            request.getStaff().getDesignation().getId().equals(req.getDesignation().getId()))
                    .count();
                return approvedCount >= req.getRequiredCount();
            });
            
            // Also check total staff count
            boolean totalCountMet = approvedRequests.size() >= openShift.getTotalStaffNeeded();
            
            requirementsMet = allDesignationsMet && totalCountMet;
        }
        
        // Update status
        String newStatus = requirementsMet ? "READY_TO_RUN" : "AVAILABLE";
        if (!newStatus.equals(openShift.getStatus())) {
            openShift.setStatus(newStatus);
            openShiftRepository.save(openShift);
            System.out.println("📊 Open shift " + openShift.getId() + " status updated: " + newStatus + 
                               " (Approved: " + approvedRequests.size() + "/" + openShift.getTotalStaffNeeded() + ")");
        }
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
            
            // Check and update status for each open shift before returning
            openShifts.forEach(this::checkAndUpdateOpenShiftStatus);
            
            // Get current user if provided - try both "test" and "staff" domains
            Staff currentStaff = null;
            if (userEmail != null) {
                Optional<User> userOpt = userRepository.findByDomainAndEmail("test", userEmail);
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
                }
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
            
            // Check and update status before returning details
            checkAndUpdateOpenShiftStatus(openShift);
            
            // Get current user if provided - try both "test" and "staff" domains
            Staff currentStaff = null;
            if (userEmail != null) {
                Optional<User> userOpt = userRepository.findByDomainAndEmail("test", userEmail);
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
                }
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
            // Find user and staff - try both "test" and "staff" domains
            Optional<User> userOpt = userRepository.findByDomainAndEmail("test", userEmail);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByDomainAndEmail("staff", userEmail);
            }
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
                .status("AWAITING")
                .createdAt(LocalDateTime.now())
                .build();
            
            request = openShiftRequestRepository.save(request);
            
            // Note: Notification for open shift application approval/decline will be created
            // when the application status is updated by a manager/admin
            
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
     * 
     * Status meanings:
     * - AVAILABLE: Accepting applications
     * - READY_TO_RUN: Requirements satisfied, still accepting applications (admin hasn't approved yet)
     * - APPROVED_FOR_FORMAL: LOCKED - Admin approved, converting to formal shift, NO applications
     * - CANCELLED: Cancelled, NO applications
     */
    private List<String> validateApplication(Staff staff, OpenShift openShift) {
        List<String> errors = new ArrayList<>();
        
        // Check if open shift status allows applications
        // Only APPROVED_FOR_FORMAL and CANCELLED block applications
        if ("APPROVED_FOR_FORMAL".equals(openShift.getStatus())) {
            errors.add("This open shift has been approved and locked. It will become a formal shift soon.");
            return errors; // Early return - no need to check further
        }
        
        if ("CANCELLED".equals(openShift.getStatus())) {
            errors.add("This open shift has been cancelled");
            return errors; // Early return - no need to check further
        }
        
        // AVAILABLE and READY_TO_RUN both allow applications
        
        // Check if shift is already fully assigned
        List<ShiftAssignment> existingAssignments = shiftAssignmentRepository
            .findByShiftId(openShift.getShift().getId()).stream()
            .filter(assignment -> assignment.isActive())
            .collect(Collectors.toList());
        if (!existingAssignments.isEmpty()) {
            errors.add("This shift is no longer available");
        }
        
        // Check for duplicate application
        Optional<OpenShiftRequest> existingRequest = openShiftRequestRepository
            .findByOpenShiftAndStaff(openShift.getId(), staff.getId());
        if (existingRequest.isPresent()) {
            errors.add("You have already applied for this open shift");
        }
        
        // Check if already assigned to the shift
        List<ShiftAssignment> existingShiftAssignments = shiftAssignmentRepository
            .findByShiftId(openShift.getShift().getId()).stream()
            .filter(assignment -> assignment.getStaff().getId().equals(staff.getId()) && assignment.isActive())
            .collect(Collectors.toList());
        if (!existingShiftAssignments.isEmpty()) {
            errors.add("You are already assigned to this shift");
        }
        
        // Check designation requirements
        List<ShiftDesignationRequirements> requirements = designationRequirementsRepository
            .findByShiftId(openShift.getShift().getId());
        
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
        
        // Get shift details from the associated shift
        Shift shift = openShift.getShift();
        
        // Get hospital name and address from location or department
        String hospitalName = null;
        String hospitalAddress = null;
        if (shift.getLocation() != null && shift.getLocation().getHospital() != null) {
            hospitalName = shift.getLocation().getHospital().getName();
            hospitalAddress = shift.getLocation().getHospital().getAddress();
        } else if (shift.getDepartment() != null && shift.getDepartment().getHospital() != null) {
            hospitalName = shift.getDepartment().getHospital().getName();
            hospitalAddress = shift.getDepartment().getHospital().getAddress();
        }
        
        // Use the start timestamp to determine the date, but ensure we're using the correct timezone
        // For overnight shifts, the date should be based on when the shift STARTS, not when it ends
        // Convert to UTC to avoid timezone issues - the date should be based on the actual start time
        LocalDate startDate = shift.getStartTs().toInstant(java.time.ZoneOffset.UTC).atZone(java.time.ZoneOffset.UTC).toLocalDate();
        String dateStr = startDate.format(dateFormatter);
        System.out.println("🔍 OpenShiftController - Converting open shift " + openShift.getId() + 
                          ": startTs=" + shift.getStartTs() + 
                          ", endTs=" + shift.getEndTs() + 
                          ", date=" + dateStr + 
                          ", originalLocalDate=" + shift.getStartTs().toLocalDate());
        
        OpenShiftDto.OpenShiftDtoBuilder builder = OpenShiftDto.builder()
            .id(openShift.getId())
            .startTs(shift.getStartTs())
            .endTs(shift.getEndTs())
            .date(dateStr)
            .start(shift.getStartTs().format(timeFormatter))
            .end(shift.getEndTs().format(timeFormatter))
            .session(shift.getType())
            .departmentName(shift.getDepartment() != null ? shift.getDepartment().getName() : null)
            .locationName(shift.getLocation() != null ? shift.getLocation().getName() : null)
            .hospitalName(hospitalName)
            .hospitalAddress(hospitalAddress)
            .type(shift.getType())
            .name(shift.getName())
            .note(shift.getNote())
            .paymentCents(openShift.getExtraPayCents())
            .formattedPayment(openShift.getExtraPayCents() != null ? 
                String.format("$%.2f", openShift.getExtraPayCents() / 100.0) : null)
            .status(openShift.getStatus() != null ? openShift.getStatus() : "AVAILABLE")
            .createdAt(openShift.getCreatedAt())
            .urgentFlag(openShift.getUrgentFlag())
            .createdByName(openShift.getCreatedBy() != null ? 
                openShift.getCreatedBy().getFirstName() + " " + openShift.getCreatedBy().getLastName() : null);
        
        // Get designation requirements from the associated shift
        List<ShiftDesignationRequirements> requirements = designationRequirementsRepository
            .findByShiftId(shift.getId());
        
        // Get APPROVED requests (these are the staff approved for this open shift)
        List<OpenShiftRequest> approvedRequests = openShiftRequestRepository
            .findByOpenShiftIdOrderByCreatedAtDesc(openShift.getId()).stream()
            .filter(req -> "APPROVED".equals(req.getStatus()))
            .collect(Collectors.toList());
        
        List<DesignationRequirementDto> requirementDtos = requirements.stream()
            .map(req -> {
                // Count APPROVED requests for this designation
                long currentCount = approvedRequests.stream()
                    .filter(request -> request.getStaff().getDesignation() != null &&
                            request.getStaff().getDesignation().getId().equals(req.getDesignation().getId()))
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
        
        // Get assigned staff from shift assignments
        List<ShiftAssignment> shiftAssignments = shiftAssignmentRepository
            .findByShiftId(shift.getId()).stream()
            .filter(assignment -> assignment.isActive())
            .collect(Collectors.toList());
        
        List<CoworkerDto> coworkerDtos = shiftAssignments.stream()
            .map(assignment -> {
                Staff staff = assignment.getStaff();
                String initials = (staff.getFirstName().substring(0, 1) + staff.getLastName().substring(0, 1)).toUpperCase();
                
                return CoworkerDto.builder()
                    .id(staff.getId().toString())
                    .name(staff.getFirstName() + " " + staff.getLastName())
                    .initials(initials)
                    .designationName(staff.getDesignation() != null ? staff.getDesignation().getName() : null)
                    .isLead(assignment.getIsLead())
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
