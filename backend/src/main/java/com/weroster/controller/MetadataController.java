package com.weroster.controller;

import com.weroster.entity.Designation;
import com.weroster.entity.Hospital;
import com.weroster.repository.DesignationRepository;
import com.weroster.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metadata")
@CrossOrigin(origins = "*")
public class MetadataController {
    
    @Autowired
    private HospitalRepository hospitalRepository;
    
    @Autowired
    private DesignationRepository designationRepository;
    
    /**
     * Get filter metadata for open shifts
     * Returns hospitals, designations, and shift types
     */
    @GetMapping("/filters")
    public ResponseEntity<Map<String, Object>> getFilterMetadata() {
        try {
            // Get all hospitals
            List<Hospital> hospitals = hospitalRepository.findAll();
            List<String> hospitalNames = hospitals.stream()
                    .map(Hospital::getName)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            // Get all active designations
            List<Designation> designations = designationRepository.findAll();
            List<String> designationNames = designations.stream()
                    .filter(d -> "ACTIVE".equals(d.getStatus()))
                    .map(Designation::getName)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            // Shift types are fixed
            List<String> shiftTypes = List.of("AM", "PM", "AH", "ON_CALL");
            
            Map<String, Object> response = new HashMap<>();
            response.put("hospitals", hospitalNames);
            response.put("designations", designationNames);
            response.put("shiftTypes", shiftTypes);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch filter metadata: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

