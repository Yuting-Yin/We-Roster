package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "open_shift")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
    
    @Column(name = "urgent_flag")
    private Boolean urgentFlag;
    
    @Column(name = "extra_pay_cents")
    private Integer extraPayCents;
    
    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, READY_TO_RUN, APPROVED_FOR_FORMAL, CANCELLED
    
    @Column(name = "total_staff_needed", nullable = false)
    @Builder.Default
    private Integer totalStaffNeeded = 1;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    private Staff createdBy;
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
