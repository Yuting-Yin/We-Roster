package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_department")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDepartment {
    @EmbeddedId
    private StaffDepartmentId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @MapsId("staffId")
    private Staff staff;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    @MapsId("deptId")
    private Department department;
    
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;
    
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class StaffDepartmentId {
    @Column(name = "staff_id")
    private Long staffId;
    
    @Column(name = "dept_id")
    private Long deptId;
}
