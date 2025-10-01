package com.weroster.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "open_shift_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenShiftAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "open_shift_id", nullable = false)
    private OpenShift openShift;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;
    
    @Column(name = "is_lead", nullable = false)
    @Builder.Default
    private Boolean isLead = false;
    
    @Column(name = "assigned_at", nullable = false)
    @Builder.Default
    private LocalDateTime assignedAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by")
    private Staff assignedBy;
    
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    // Helper methods
    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
    
    public boolean isWithdrawn() {
        return "WITHDRAWN".equals(status);
    }
    
    public boolean isCancelled() {
        return "CANCELLED".equals(status);
    }
}
