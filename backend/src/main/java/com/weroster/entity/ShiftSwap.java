package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_swap")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSwap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_time", nullable = false)
    private LocalDateTime fromTime;
    
    @Column(name = "to_time", nullable = false)
    private LocalDateTime toTime;
    
    @Column(name = "date_made", nullable = false)
    private LocalDateTime dateMade;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private Staff requester;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id")
    private Staff target;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "AWAITING";
}
