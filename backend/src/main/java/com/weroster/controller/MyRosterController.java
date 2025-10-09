package com.weroster.controller;

import com.weroster.dto.*;
import com.weroster.entity.*;
import com.weroster.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/myroster")
@CrossOrigin(origins = "*")
public class MyRosterController {
    
    @Autowired
    private ShiftRepository shiftRepository;
    
    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Helper method to get current user from Authorization header
     */
    private User getCurrentUser(String authHeader) {
        try {
            System.out.println("🔍 MyRosterController - getCurrentUser called with authHeader: " + 
                (authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null"));
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("🔍 MyRosterController - Missing or invalid authorization header");
                throw new RuntimeException("Missing or invalid authorization header");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            System.out.println("🔍 MyRosterController - Extracted token: " + token);
            
            // Simplified token parsing - in production, use proper JWT library
            if (!token.startsWith("jwt_token_")) {
                System.out.println("🔍 MyRosterController - Invalid token format");
                throw new RuntimeException("Invalid token format");
            }
            
            String[] parts = token.split("_");
            System.out.println("🔍 MyRosterController - Token parts: " + Arrays.toString(parts));
            if (parts.length < 3) {
                System.out.println("🔍 MyRosterController - Not enough token parts");
                throw new RuntimeException("Invalid token format");
            }
            
            Long userId = Long.parseLong(parts[2]);
            System.out.println("🔍 MyRosterController - Parsed userId: " + userId);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("🔍 MyRosterController - Found user: " + user.getEmail());
            return user;
                
        } catch (Exception e) {
            System.out.println("🔍 MyRosterController - Authentication error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to find staff linked to a user using direct relationship
     */
    private Staff findStaffByUser(User user) {
        return staffRepository.findAll().stream()
            .filter(staff -> staff.getUser() != null && staff.getUser().getId().equals(user.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No staff linked to user"));
    }
    
    /**
     * Get priority for shift type sorting (higher = more important)
     */
    private int getPriority(String shiftCode) {
        switch (shiftCode) {
            case "ON_CALL": return 4;
            case "AH": return 3;
            case "PM": return 2;
            case "AM": return 1;
            default: return 0;
        }
    }
    
    @GetMapping("/day")
    public ResponseEntity<DayRosterDto> getDayRoster(
            @RequestParam(required = false) String date,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            LocalDateTime targetDate = date != null ? 
                LocalDate.parse(date).atStartOfDay() : 
                LocalDate.now().atStartOfDay();
            
            System.out.println("🔍 Looking for shifts on date: " + targetDate);
            
            // Get current user from JWT token
            User currentUser = getCurrentUser(authHeader);
            
            System.out.println("👤 Current user: " + currentUser.getEmail());
            
            // Find the staff member linked to this user
            Staff staff = findStaffByUser(currentUser);
            System.out.println("👨‍⚕️ Linked staff: " + staff.getFirstName() + " " + staff.getLastName() + " (ID: " + staff.getId() + ")");
            
            // Get shift assignments for this staff member on the target date
            LocalDateTime endDate = targetDate.plusDays(1);
            System.out.println("🔍 DEBUG: Looking for shifts between " + targetDate + " and " + endDate);
            System.out.println("🔍 DEBUG: Staff ID: " + staff.getId());
            
            // Let's also test the query directly
            System.out.println("🔍 DEBUG: Testing direct query for staff " + staff.getId());
            List<ShiftAssignment> allAssignmentsForStaff = shiftAssignmentRepository.findAll().stream()
                .filter(sa -> sa.getStaff().getId().equals(staff.getId()))
                .collect(Collectors.toList());
            System.out.println("🔍 DEBUG: Found " + allAssignmentsForStaff.size() + " total assignments for staff " + staff.getId());
            
            allAssignmentsForStaff.forEach(sa -> {
                System.out.println("🔍 DEBUG: Assignment " + sa.getId() + " - Shift " + sa.getShift().getId() + " starts at " + sa.getShift().getStartTs());
            });
            
            List<ShiftAssignment> assignments = shiftAssignmentRepository.findByStaffAndDate(staff.getId(), targetDate, endDate);
            System.out.println("📅 Found " + assignments.size() + " shift assignments for staff " + staff.getId());
            
            List<ShiftItem> shiftItems = assignments.stream()
                    .map(assignment -> {
                        Shift shift = assignment.getShift();
                        System.out.println("🔄 Processing shift: " + shift.getId() + " at " + shift.getStartTs());
                        System.out.println("🔄 Shift department: " + (shift.getDepartment() != null ? shift.getDepartment().getName() : "NULL"));
                        System.out.println("🔄 Shift location: " + (shift.getLocation() != null ? shift.getLocation().getName() : "NULL"));
                        System.out.println("🔄 Shift type: " + shift.getType());
                        
                        // Get all assignments for this shift to count coworkers and build teammates
                        List<ShiftAssignment> allAssignments = shiftAssignmentRepository.findByShiftId(shift.getId());
                        System.out.println("👥 Found " + allAssignments.size() + " total assignments for shift " + shift.getId());
                        
                        // Build teammates list (excluding current user)
                        List<TeammateDto> teammates = allAssignments.stream()
                                .filter(sa -> !sa.getStaff().getId().equals(staff.getId())) // Exclude current user
                                .map(sa -> {
                                    String fullName = sa.getStaff().getFirstName() + " " + sa.getStaff().getLastName();
                                    String initials = sa.getStaff().getFirstName().substring(0, 1) + 
                                                    sa.getStaff().getLastName().substring(0, 1);
                                    return new TeammateDto(
                                            sa.getStaff().getId(),
                                            fullName,
                                            initials.toUpperCase(),
                                            sa.getIsLead()
                                    );
                                })
                                .collect(Collectors.toList());
                        
                        // Get hospital/campus information
                        String campus = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getName() : "";
                        String campusAddress = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getAddress() : "";
                        
                        // Get the current staff member's designation for role
                        String role = assignment.getStaff().getDesignation() != null 
                                ? assignment.getStaff().getDesignation().getName() 
                                : "Staff";

                        ShiftItem shiftItem = new ShiftItem(
                                shift.getId(),
                                shift.getStartTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                                shift.getEndTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                                shift.getDepartment() != null ? shift.getDepartment().getName() : "",
                                shift.getLocation() != null ? shift.getLocation().getName() : "",
                                shift.getType(),
                                assignment.getIsLead(),
                                allAssignments.size(),
                                shift.getNote(),
                                teammates,
                                campus,
                                shift.getLocation() != null ? shift.getLocation().getName() : "",
                                campusAddress
                        );
                        
                        // Set the shift name
                        shiftItem.setShiftName(shift.getName());
                        
                        // Set the role (designation) for the current staff member
                        shiftItem.setRole(role);
                        
                        System.out.println("✅ Created ShiftItem: " + shiftItem.getId() + " - " + shiftItem.getStartTs() + " to " + shiftItem.getEndTs());
                        return shiftItem;
                    })
                    .collect(Collectors.toList());
            
            System.out.println("✅ Returning " + shiftItems.size() + " shift items for user");
            
            DayRosterDto response = new DayRosterDto(
                    targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    shiftItems
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error in getDayRoster: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @GetMapping("/debug-shifts")
    public ResponseEntity<?> debugShifts() {
        try {
            LocalDateTime today = LocalDate.now().atStartOfDay();
            LocalDateTime tomorrow = today.plusDays(1);
            
            System.out.println("🔍 DEBUG: Checking all shifts between " + today + " and " + tomorrow);
            
            // Get all shifts for today
            List<Shift> allShifts = shiftRepository.findByDateRange(today, tomorrow);
            System.out.println("🔍 DEBUG: Found " + allShifts.size() + " total shifts in database");
            
            // Get all shift assignments for today
            List<ShiftAssignment> allAssignments = shiftAssignmentRepository.findAll();
            System.out.println("🔍 DEBUG: Found " + allAssignments.size() + " total shift assignments");
            
            Map<String, Object> result = new HashMap<>();
            result.put("dateRange", Map.of("start", today.toString(), "end", tomorrow.toString()));
            result.put("totalShifts", allShifts.size());
            result.put("totalAssignments", allAssignments.size());
            
            List<Map<String, Object>> shiftDetails = allShifts.stream().map(shift -> {
                Map<String, Object> shiftInfo = new HashMap<>();
                shiftInfo.put("id", shift.getId());
                shiftInfo.put("startTs", shift.getStartTs().toString());
                shiftInfo.put("endTs", shift.getEndTs().toString());
                shiftInfo.put("type", shift.getType());
                shiftInfo.put("department", shift.getDepartment() != null ? shift.getDepartment().getName() : "NULL");
                shiftInfo.put("location", shift.getLocation() != null ? shift.getLocation().getName() : "NULL");
                return shiftInfo;
            }).collect(Collectors.toList());
            
            result.put("shifts", shiftDetails);
            
            List<Map<String, Object>> assignmentDetails = allAssignments.stream().map(assignment -> {
                Map<String, Object> assignmentInfo = new HashMap<>();
                assignmentInfo.put("id", assignment.getId());
                assignmentInfo.put("staffId", assignment.getStaff().getId());
                assignmentInfo.put("shiftId", assignment.getShift().getId());
                assignmentInfo.put("shiftStartTs", assignment.getShift().getStartTs().toString());
                assignmentInfo.put("isLead", assignment.getIsLead());
                return assignmentInfo;
            }).collect(Collectors.toList());
            
            result.put("assignments", assignmentDetails);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug-step1")
    public ResponseEntity<?> debugStep1() {
        try {
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            Map<String, Object> result = new HashMap<>();
            result.put("step", "1 - User lookup");
            result.put("user", Map.of("id", currentUser.getId(), "email", currentUser.getEmail()));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/debug-step2")
    public ResponseEntity<?> debugStep2() {
        try {
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            Staff staff = findStaffByUser(currentUser);
            
            Map<String, Object> result = new HashMap<>();
            result.put("step", "2 - Direct User-Staff relationship");
            result.put("user", Map.of("id", currentUser.getId(), "email", currentUser.getEmail()));
            result.put("staff", Map.of("id", staff.getId(), "name", staff.getFirstName() + " " + staff.getLastName()));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/debug-step3")
    public ResponseEntity<?> debugStep3() {
        try {
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            Staff staff = findStaffByUser(currentUser);
            
            LocalDateTime today = LocalDate.now().atStartOfDay();
            LocalDateTime tomorrow = today.plusDays(1);
            List<ShiftAssignment> assignments = shiftAssignmentRepository.findByStaffAndDate(staff.getId(), today, tomorrow);
            
            Map<String, Object> result = new HashMap<>();
            result.put("step", "3 - Shift assignments");
            result.put("staff", Map.of("id", staff.getId(), "name", staff.getFirstName() + " " + staff.getLastName()));
            result.put("dateRange", Map.of("start", today.toString(), "end", tomorrow.toString()));
            result.put("assignments", assignments.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get shift details by ID
     */
    @GetMapping("/shift/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ShiftDetailsDto> getShiftDetails(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 MyRosterController - getShiftDetails called for shift ID: " + id);
            System.out.println("🔍 MyRosterController - Authorization header present: " + (authHeader != null));
            
            // Get current user from JWT token
            User currentUser = getCurrentUser(authHeader);
            System.out.println("👤 Current user: " + currentUser.getEmail());
            
            Staff staff = findStaffByUser(currentUser);
            System.out.println("🔍 MyRosterController - Found staff: " + staff.getId());
            
            // Find the shift
            Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
            
            System.out.println("🔍 MyRosterController - Found shift: " + shift.getId());
            
            // Check if the staff member is assigned to this shift
            List<ShiftAssignment> assignments = shiftAssignmentRepository.findByShiftId(id);
            boolean isAssigned = assignments.stream()
                .anyMatch(assignment -> assignment.getStaff().getId().equals(staff.getId()));
            
            if (!isAssigned) {
                System.out.println("🔍 MyRosterController - Staff not assigned to this shift");
                return ResponseEntity.status(403).body(null);
            }
            
            // Get all coworkers for this shift
            List<CoworkerDto> coworkers = assignments.stream()
                .map(assignment -> {
                    Staff coworkerStaff = assignment.getStaff();
                    return CoworkerDto.builder()
                        .id(coworkerStaff.getId().toString())
                        .name(coworkerStaff.getFirstName() + " " + coworkerStaff.getLastName())
                        .initials((coworkerStaff.getFirstName().charAt(0) + "" + coworkerStaff.getLastName().charAt(0)).toUpperCase())
                        .designationName(coworkerStaff.getDesignation() != null ? coworkerStaff.getDesignation().getName() : "Any")
                        .isLead(false) // TODO: Determine if this staff member is a lead
                        .build();
                })
                .collect(Collectors.toList());
            
            // Build location info
            LocationDto location = LocationDto.builder()
                .name(shift.getLocation() != null ? shift.getLocation().getName() : "Unknown")
                .code(shift.getLocation() != null ? shift.getLocation().getCode() : null)
                .type(shift.getLocation() != null ? shift.getLocation().getType() : null)
                .build();
            
            // Calculate duration
            long durationMinutes = java.time.Duration.between(shift.getStartTs(), shift.getEndTs()).toMinutes();
            
            // Build response
            ShiftDetailsDto response = ShiftDetailsDto.builder()
                .date(shift.getStartTs().toLocalDate().toString())
                .shiftId(shift.getId())
                .startTime(shift.getStartTs().format(DateTimeFormatter.ofPattern("HH:mm")))
                .endTime(shift.getEndTs().format(DateTimeFormatter.ofPattern("HH:mm")))
                .durationMinutes((int) durationMinutes)
                .location(location)
                .designation("Any") // TODO: Get designation from shift or staff
                .coworkers(coworkers)
                .build();
            
            System.out.println("🔍 MyRosterController - Returning shift details for shift " + id);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("🔍 MyRosterController - Error getting shift details: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debugUserStaffRelationship() {
        try {
            // Test user lookup
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            System.out.println("🔍 DEBUG: Found user: " + currentUser.getEmail() + " (ID: " + currentUser.getId() + ")");
            
            // Test user-staff link
            Staff staff = findStaffByUser(currentUser);
            System.out.println("🔍 DEBUG: Found staff: " + staff.getFirstName() + " " + staff.getLastName() + " (ID: " + staff.getId() + ")");
            
            // Test shift assignments
            LocalDateTime today = LocalDate.now().atStartOfDay();
            LocalDateTime tomorrow = today.plusDays(1);
            List<ShiftAssignment> assignments = shiftAssignmentRepository.findByStaffAndDate(staff.getId(), today, tomorrow);
            
            System.out.println("🔍 DEBUG: Found " + assignments.size() + " shift assignments");
            
            Map<String, Object> result = new HashMap<>();
            result.put("user", Map.of("id", currentUser.getId(), "email", currentUser.getEmail()));
            result.put("staff", Map.of("id", staff.getId(), "name", staff.getFirstName() + " " + staff.getLastName()));
            result.put("assignments", assignments.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ DEBUG Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("🔍 MyRosterController - testAuth endpoint called");
            System.out.println("🔍 MyRosterController - Authorization header: " + (authHeader != null ? "present" : "missing"));
            
            if (authHeader == null) {
                return ResponseEntity.ok(Map.of("message", "No authorization header", "status", "no_auth"));
            }
            
            // Try to get current user
            try {
                User currentUser = getCurrentUser(authHeader);
                return ResponseEntity.ok(Map.of(
                    "message", "Authentication successful",
                    "user", Map.of(
                        "id", currentUser.getId(),
                        "email", currentUser.getEmail(),
                        "status", currentUser.getStatus()
                    ),
                    "status", "success"
                ));
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of(
                    "message", "Authentication failed: " + e.getMessage(),
                    "status", "auth_failed"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/roster")
    public ResponseEntity<Map<String, Object>> getRoster(
            @RequestParam String month,
            @RequestParam(defaultValue = "2") int months) {
        try {
            // Parse month parameter (format: "2025-09")
            String[] parts = month.split("-");
            int year = Integer.parseInt(parts[0]);
            int monthNum = Integer.parseInt(parts[1]) - 1; // Java months are 0-based
            
            LocalDateTime startDate = LocalDate.of(year, monthNum + 1, 1).atStartOfDay();
            LocalDateTime endDate = startDate.plusMonths(months).minusDays(1).withHour(23).withMinute(59).withSecond(59);
            
            System.out.println("🔍 Getting roster for range: " + startDate + " to " + endDate);
            
            // Get the test user
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            // Find the staff member linked to this user
            Staff staff = findStaffByUser(currentUser);
            System.out.println("👨‍⚕️ Getting roster for staff: " + staff.getFirstName() + " " + staff.getLastName());
            
            // Get all shift assignments for this staff member in the date range
            List<ShiftAssignment> assignments = shiftAssignmentRepository.findAll().stream()
                .filter(sa -> sa.getStaff().getId().equals(staff.getId()))
                .filter(sa -> sa.getShift().getStartTs().isAfter(startDate.minusDays(1)))
                .filter(sa -> sa.getShift().getStartTs().isBefore(endDate.plusDays(1)))
                .collect(Collectors.toList());
            
            System.out.println("📅 Found " + assignments.size() + " assignments in range");
            
            // Build shiftMap and events
            Map<String, Object> shiftMap = new HashMap<>();
            Map<String, Object> events = new HashMap<>();
            
            // Group assignments by date
            Map<String, List<ShiftAssignment>> assignmentsByDate = assignments.stream()
                .collect(Collectors.groupingBy(
                    sa -> sa.getShift().getStartTs().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
                ));
            
            // Process each date
            assignmentsByDate.forEach((dateStr, dateAssignments) -> {
                // Collect all unique shift types for this day (support multiple shifts per day)
                List<String> shiftTypes = dateAssignments.stream()
                    .map(sa -> sa.getShift().getType())
                    .distinct()
                    .sorted((a, b) -> {
                        // Sort by priority: ON_CALL > AH > PM > AM
                        int priorityA = getPriority(a);
                        int priorityB = getPriority(b);
                        return Integer.compare(priorityB, priorityA); // Reverse order (higher priority first)
                    })
                    .collect(Collectors.toList());
                
                // Store all shift types for this date (as array for frontend)
                shiftMap.put(dateStr, shiftTypes);
                
                // Build events for this date
                List<Map<String, Object>> dateEvents = dateAssignments.stream()
                    .map(assignment -> {
                        Shift shift = assignment.getShift();
                        
                        // Get all assignments for this shift to count coworkers and build teammates
                        List<ShiftAssignment> allAssignments = shiftAssignmentRepository.findByShiftId(shift.getId());
                        
                        // Build teammates list (excluding current user)
                        List<Map<String, Object>> teammates = allAssignments.stream()
                            .filter(sa -> !sa.getStaff().getId().equals(staff.getId()))
                            .map(sa -> {
                                String fullName = sa.getStaff().getFirstName() + " " + sa.getStaff().getLastName();
                                String initials = sa.getStaff().getFirstName().substring(0, 1) + 
                                                sa.getStaff().getLastName().substring(0, 1);
                                Map<String, Object> teammate = new HashMap<>();
                                teammate.put("staffId", sa.getStaff().getId());
                                teammate.put("staffName", fullName);
                                teammate.put("staffInitials", initials.toUpperCase());
                                teammate.put("isLead", sa.getIsLead());
                                return teammate;
                            })
                            .collect(Collectors.toList());
                        
                        // Get hospital/campus information
                        String campus = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getName() : "";
                        String campusAddress = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getAddress() : "";
                        
                        // Get the current staff member's designation for role
                        String role = assignment.getStaff().getDesignation() != null 
                                ? assignment.getStaff().getDesignation().getName() 
                                : "Staff";
                        
                        Map<String, Object> event = new HashMap<>();
                        event.put("id", shift.getId().toString());
                        event.put("startTs", shift.getStartTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                        event.put("endTs", shift.getEndTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                        event.put("dept", shift.getDepartment() != null ? shift.getDepartment().getName() : "");
                        event.put("location", shift.getLocation() != null ? shift.getLocation().getName() : "");
                        event.put("type", shift.getType());
                        event.put("isLead", assignment.getIsLead());
                        event.put("coworkers", allAssignments.size());
                        event.put("note", shift.getNote());
                        event.put("teammates", teammates);
                        event.put("campus", campus);
                        event.put("room", shift.getLocation() != null ? shift.getLocation().getName() : "");
                        event.put("campusAddress", campusAddress);
                        event.put("role", role);
                        
                        return event;
                    })
                    .collect(Collectors.toList());
                
                events.put(dateStr, dateEvents);
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("shiftMap", shiftMap);
            response.put("events", events);
            
            System.out.println("✅ Returning roster with " + shiftMap.size() + " dates and " + events.size() + " event groups");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error in getRoster: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/refresh")
    public ResponseEntity<RefreshResponse> refreshRoster(
            @RequestParam(required = false) String date,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            LocalDateTime targetDate = date != null ? 
                LocalDate.parse(date).atStartOfDay() : 
                LocalDate.now().atStartOfDay();
            
            // Get current user from JWT token
            User currentUser = getCurrentUser(authHeader);
            
            // Get shifts for the week
            List<Shift> shifts = shiftRepository.findByDate(targetDate);
            
            // Build calendar days
            List<CalendarDayDto> calendarDays = new ArrayList<>();
            for (int i = 0; i < 7; i++) {
                LocalDate day = targetDate.toLocalDate().plusDays(i);
                boolean isToday = day.equals(LocalDate.now());
                
                CalendarDayDto calendarDay = new CalendarDayDto(
                        day.format(DateTimeFormatter.ISO_LOCAL_DATE),
                        false, // assignedAM
                        false, // assignedPM
                        isToday
                );
                calendarDays.add(calendarDay);
            }
            
            // Build week info
            WeekDto week = new WeekDto(
                    targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    targetDate.plusDays(6).format(DateTimeFormatter.ISO_LOCAL_DATE)
            );
            
            // Build timeline (same as day roster)
            List<ShiftItem> shiftItems = shifts.stream()
                    .map(shift -> {
                        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByShiftId(shift.getId());
                        
                        // Build teammates list (empty for refresh - we don't have current user context)
                        List<TeammateDto> teammates = assignments.stream()
                                .map(sa -> {
                                    String fullName = sa.getStaff().getFirstName() + " " + sa.getStaff().getLastName();
                                    String initials = sa.getStaff().getFirstName().substring(0, 1) + 
                                                    sa.getStaff().getLastName().substring(0, 1);
                                    return new TeammateDto(
                                            sa.getStaff().getId(),
                                            fullName,
                                            initials.toUpperCase(),
                                            sa.getIsLead()
                                    );
                                })
                                .collect(Collectors.toList());
                        
                        // Get hospital/campus information
                        String campus = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getName() : "";
                        String campusAddress = shift.getDepartment() != null && shift.getDepartment().getHospital() != null ? 
                                shift.getDepartment().getHospital().getAddress() : "";
                        
                        ShiftItem shiftItem = new ShiftItem(
                                shift.getId(),
                                shift.getStartTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                                shift.getEndTs().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                                shift.getDepartment() != null ? shift.getDepartment().getName() : "",
                                shift.getLocation() != null ? shift.getLocation().getName() : "",
                                shift.getType(),
                                assignments.stream().anyMatch(ShiftAssignment::getIsLead),
                                assignments.size(),
                                shift.getNote(),
                                teammates,
                                campus,
                                shift.getLocation() != null ? shift.getLocation().getName() : "",
                                campusAddress
                        );
                        
                        // Set the shift name
                        shiftItem.setShiftName(shift.getName());
                        
                        return shiftItem;
                    })
                    .collect(Collectors.toList());
            
            DayRosterDto timeline = new DayRosterDto(
                    targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    shiftItems
            );
            
            RefreshResponse response = new RefreshResponse(week, calendarDays, timeline);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}