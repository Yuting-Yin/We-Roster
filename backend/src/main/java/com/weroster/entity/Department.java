package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "dept")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parent;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    @Column(name = "name", nullable = false, length = 300)
    private String name;
    
    @Column(name = "code", length = 60, unique = true)
    private String code;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Department> children;
    
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<StaffDepartment> staffDepartments;
    
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Shift> shifts;
}
