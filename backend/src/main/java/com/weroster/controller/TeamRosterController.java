package com.weroster.controller;

import com.weroster.dto.TeamRosterResponse;
import com.weroster.dto.TeamRosterTableDto;
import com.weroster.dto.TeamRosterCellDto;
import com.weroster.dto.TeamRosterShiftDto;
import com.weroster.entity.Shift;
import com.weroster.entity.ShiftAssignment;
import com.weroster.entity.Staff;
import com.weroster.repository.ShiftRepository;
import com.weroster.repository.ShiftAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/team-roster")
@CrossOrigin(origins = "*")
public class TeamRosterController {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;

    /**
     * Get team roster data for a specific date
     */
    @GetMapping
    public ResponseEntity<TeamRosterResponse> getTeamRoster(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        try {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            // Get all shifts for the date
            List<Shift> shifts = shiftRepository.findByDateRange(startOfDay, endOfDay);
            
            // Group shifts by hospital/department
            Map<String, List<Shift>> shiftsByHospital = shifts.stream()
                    .filter(shift -> shift.getDepartment() != null && shift.getDepartment().getHospital() != null)
                    .collect(Collectors.groupingBy(
                            shift -> shift.getDepartment().getHospital().getName()
                    ));
            
            List<TeamRosterTableDto> tables = shiftsByHospital.entrySet().stream()
                    .map(entry -> buildHospitalTable(entry.getKey(), entry.getValue()))
                    .collect(Collectors.toList());
            
            TeamRosterResponse response = new TeamRosterResponse();
            response.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            response.setTables(tables);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching team roster: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get team roster data for a date range (week)
     */
    @GetMapping("/week")
    public ResponseEntity<List<TeamRosterResponse>> getTeamRosterWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<TeamRosterResponse> responses = new ArrayList<>();
            
            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                LocalDateTime startOfDay = currentDate.atStartOfDay();
                LocalDateTime endOfDay = currentDate.plusDays(1).atStartOfDay();
                
                List<Shift> shifts = shiftRepository.findByDateRange(startOfDay, endOfDay);
                
                Map<String, List<Shift>> shiftsByHospital = shifts.stream()
                        .filter(shift -> shift.getDepartment() != null && shift.getDepartment().getHospital() != null)
                        .collect(Collectors.groupingBy(
                                shift -> shift.getDepartment().getHospital().getName()
                        ));
                
                List<TeamRosterTableDto> tables = shiftsByHospital.entrySet().stream()
                        .map(entry -> buildHospitalTable(entry.getKey(), entry.getValue()))
                        .collect(Collectors.toList());
                
                TeamRosterResponse response = new TeamRosterResponse();
                response.setDate(currentDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
                response.setTables(tables);
                responses.add(response);
                
                currentDate = currentDate.plusDays(1);
            }
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            System.err.println("Error fetching team roster week: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available filter options
     */
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        try {
            Map<String, List<String>> options = new HashMap<>();
            
            // Get unique shift types
            List<String> shiftTypes = Arrays.asList("AM", "PM", "AH", "ON_CALL");
            
            // Get unique designations from staff
            List<String> designations = shiftAssignmentRepository.findAll().stream()
                    .map(assignment -> assignment.getStaff().getDesignation())
                    .filter(Objects::nonNull)
                    .map(designation -> designation.getName())
                    .distinct()
                    .collect(Collectors.toList());
            
            options.put("shiftTypes", shiftTypes);
            options.put("designations", designations);
            
            return ResponseEntity.ok(options);
            
        } catch (Exception e) {
            System.err.println("Error fetching filter options: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private TeamRosterTableDto buildHospitalTable(String hospitalName, List<Shift> shifts) {
        TeamRosterTableDto table = new TeamRosterTableDto();
        table.setHospital(hospitalName);
        
        // Get unique rooms/locations
        Set<String> rooms = shifts.stream()
                .filter(shift -> shift.getLocation() != null)
                .map(shift -> shift.getLocation().getName())
                .collect(Collectors.toSet());
        
        // Add "On Call" as a special room
        rooms.add("On Call");
        
        table.setRooms(new ArrayList<>(rooms));
        
        // Build cells for each room and shift type combination
        List<TeamRosterCellDto> cells = new ArrayList<>();
        
        // Define shift types
        List<String> shiftTypes = Arrays.asList("ON_CALL", "AM", "PM", "AH");
        
        for (String room : rooms) {
            for (String shiftType : shiftTypes) {
                TeamRosterCellDto cell = new TeamRosterCellDto();
                cell.setRoom(room);
                cell.setShiftType(shiftType);
                
                // Filter shifts for this room and type
                List<TeamRosterShiftDto> cellShifts = shifts.stream()
                        .filter(shift -> matchesRoomAndType(shift, room, shiftType))
                        .map(this::convertShiftToDto)
                        .collect(Collectors.toList());
                
                cell.setShifts(cellShifts);
                cells.add(cell);
            }
        }
        
        table.setCells(cells);
        return table;
    }

    private boolean matchesRoomAndType(Shift shift, String room, String shiftType) {
        // Check room match
        boolean roomMatch = false;
        if ("On Call".equals(room)) {
            // For on-call shifts, check if shift name contains on-call indicators
            roomMatch = shift.getName() != null && 
                       (shift.getName().contains("[OC]") || 
                        shift.getName().toLowerCase().contains("on call") ||
                        shift.getName().toLowerCase().contains("on-call"));
        } else {
            // For regular rooms, check location match
            roomMatch = shift.getLocation() != null && 
                       room.equals(shift.getLocation().getName());
        }
        
        if (!roomMatch) return false;
        
        // Check shift type match
        return determineShiftType(shift).equals(shiftType);
    }

    private String determineShiftType(Shift shift) {
        int hour = shift.getStartTs().getHour();
        
        if (hour >= 8 && hour < 13) {
            return "AM";
        } else if (hour >= 13 && hour < 18) {
            return "PM";
        } else {
            return "AH"; // After Hours
        }
    }

    private TeamRosterShiftDto convertShiftToDto(Shift shift) {
        TeamRosterShiftDto dto = new TeamRosterShiftDto();
        dto.setId(shift.getId().toString());
        dto.setShiftName(shift.getName() != null ? shift.getName() : "Shift");
        
        // Format times
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        dto.setStartTime(shift.getStartTs().format(timeFormatter));
        dto.setEndTime(shift.getEndTs().format(timeFormatter));
        
        // Get assigned staff
        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByShiftId(shift.getId());
        List<TeamRosterShiftDto.StaffMember> assignedStaff = assignments.stream()
                .map(this::convertStaffToDto)
                .collect(Collectors.toList());
        
        dto.setAssignedStaff(assignedStaff);
        
        return dto;
    }

    private TeamRosterShiftDto.StaffMember convertStaffToDto(ShiftAssignment assignment) {
        Staff staff = assignment.getStaff();
        TeamRosterShiftDto.StaffMember staffDto = new TeamRosterShiftDto.StaffMember();
        
        staffDto.setId(staff.getId().toString());
        staffDto.setName(staff.getFirstName() + " " + staff.getLastName());
        
        // Generate initials
        String initials = "";
        if (staff.getFirstName() != null && !staff.getFirstName().isEmpty()) {
            initials += staff.getFirstName().charAt(0);
        }
        if (staff.getLastName() != null && !staff.getLastName().isEmpty()) {
            initials += staff.getLastName().charAt(0);
        }
        staffDto.setInitials(initials.toUpperCase());
        
        // Get designation
        staffDto.setDesignation(staff.getDesignation() != null ? 
                               staff.getDesignation().getName() : "Staff");
        
        return staffDto;
    }
}
