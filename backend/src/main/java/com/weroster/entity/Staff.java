package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designation_id")
    private Designation designation;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "gender", length = 16)
    private String gender;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "hire_date")
    private LocalDate hireDate;
    
    @Column(name = "leave_date")
    private LocalDate leaveDate;
    
    @Column(name = "email", length = 300)
    private String email;
    
    @Column(name = "phone", length = 32)
    private String phone;
    
    @Column(name = "is_manager", nullable = false)
    @Builder.Default
    private Boolean isManager = false;
    
    @Column(name = "type", length = 50)
    private String type;
    
    @Column(name = "matrix", length = 50)
    private String matrix;
    
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "Active";
    
    @Column(name = "status_time")
    private LocalDateTime statusTime;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "created_time", nullable = false)
    private LocalDateTime createdTime;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL)
    private List<StaffDepartment> staffDepartments;
    
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL)
    private List<ShiftAssignment> shiftAssignments;
}
