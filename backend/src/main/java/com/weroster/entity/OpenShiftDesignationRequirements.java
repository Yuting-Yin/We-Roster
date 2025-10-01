package com.weroster.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "open_shift_designation_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenShiftDesignationRequirements {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "open_shift_id", nullable = false)
    private OpenShift openShift;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designation_id", nullable = false)
    private Designation designation;
    
    @Column(name = "required_count", nullable = false)
    @Builder.Default
    private Integer requiredCount = 1;
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
