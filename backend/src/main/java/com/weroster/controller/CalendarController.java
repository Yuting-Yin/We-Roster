package com.weroster.controller;

import com.weroster.dto.CalendarDayDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
@CrossOrigin(origins = "*")
public class CalendarController {
    
    @GetMapping("/range")
    public ResponseEntity<List<CalendarDayDto>> getCalendarRange(
            @RequestParam String start,
            @RequestParam(defaultValue = "1") int months) {
        try {
            LocalDate startDate = LocalDate.parse(start);
            LocalDate endDate = startDate.plusMonths(months);
            
            List<CalendarDayDto> calendarDays = new ArrayList<>();
            LocalDate current = startDate;
            
            while (!current.isAfter(endDate)) {
                boolean isToday = current.equals(LocalDate.now());
                boolean assignedAM = false; // TODO: Check actual assignments
                boolean assignedPM = false; // TODO: Check actual assignments
                
                calendarDays.add(new CalendarDayDto(
                        current.format(DateTimeFormatter.ISO_LOCAL_DATE),
                        assignedAM,
                        assignedPM,
                        isToday
                ));
                
                current = current.plusDays(1);
            }
            
            return ResponseEntity.ok(calendarDays);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
}
