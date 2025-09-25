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
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
    
    @Column(name = "date_made", nullable = false)
    private LocalDateTime dateMade;
    
    @Column(name = "urgent_flag")
    private Boolean urgentFlag;
    
    @Column(name = "extra_pay_cents")
    private Integer extraPayCents;
}
