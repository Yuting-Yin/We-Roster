package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
    
    @Column(name = "is_lead", nullable = false)
    @Builder.Default
    private Boolean isLead = false;
    
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
