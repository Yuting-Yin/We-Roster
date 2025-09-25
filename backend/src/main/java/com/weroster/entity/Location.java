package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "location")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "code", length = 50, unique = true)
    private String code;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Location parent;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "type", length = 50)
    private String type;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Location> children;
    
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<Shift> shifts;
}
