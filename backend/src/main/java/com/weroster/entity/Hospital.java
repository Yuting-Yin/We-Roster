package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "Hospital")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "Name", nullable = false, length = 300)
    private String name;
    
    @Column(name = "Code", length = 60, unique = true)
    private String code;
    
    @Column(name = "Address", length = 1000)
    private String address;
    
    @Column(name = "Note", columnDefinition = "TEXT")
    private String note;
    
    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL)
    private List<Staff> staff;
    
    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL)
    private List<Department> departments;
    
    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL)
    private List<Location> locations;
}
