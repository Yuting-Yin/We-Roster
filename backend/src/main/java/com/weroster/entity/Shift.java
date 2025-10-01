package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "shift")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {
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
    
    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL)
    private List<ShiftAssignment> shiftAssignments;
    
    @OneToOne(mappedBy = "shift", cascade = CascadeType.ALL)
    private OpenShift openShift;
}
