package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "designation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 300)
    private String name;
    
    @Column(name = "code", length = 60)
    private String code;
    
    @Column(name = "matrix", length = 60)
    private String matrix;
    
    @Column(name = "type", length = 60)
    private String type;
    
    @Column(name = "status", nullable = false, length = 60)
    @Builder.Default
    private String status = "ACTIVE";
    
    @Column(name = "status_time")
    private LocalDateTime statusTime;
    
    @Column(name = "accreditation", length = 200)
    private String accreditation;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "created_time", nullable = false)
    private LocalDateTime createdTime;
    
    @OneToMany(mappedBy = "designation", cascade = CascadeType.ALL)
    private List<Staff> staff;
}
