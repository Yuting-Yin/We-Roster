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
    
    @Column(name = "start_ts", nullable = false)
    private LocalDateTime startTs;
    
    @Column(name = "end_ts", nullable = false)
    private LocalDateTime endTs;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dept_id")
    private Department department;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;
    
    @Column(name = "type", length = 50)
    private String type;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "date_made", nullable = false)
    private LocalDateTime dateMade;
    
    @Column(name = "urgent_flag")
    private Boolean urgentFlag;
    
    @Column(name = "extra_pay_cents")
    private Integer extraPayCents;
    
    @Column(name = "status", length = 30)
    private String status; // AVAILABLE, READY_TO_RUN, APPROVED_FOR_FORMAL, CANCELLED
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    private Staff createdBy;
}
