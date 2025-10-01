package com.weroster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    
    @Column(name = "type", nullable = false, length = 50)
    private String type;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;
    
    @Column(name = "related_entity_id")
    private Long relatedEntityId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_id")
    private User triggeredBy;
    
    // Notification types enum for type safety
    public enum NotificationType {
        EVENT_ASSIGNMENT("Event Assignment"),
        LEAVE_APPROVAL("Leave Approved"),
        LEAVE_DECLINED("Leave Declined"),
        SWAP_REQUEST("Swap Request"),
        SWAP_APPROVED("Swap Approved"),
        SWAP_DECLINED("Swap Declined"),
        OPEN_SHIFT_APPROVED("Open Shift Approved"),
        OPEN_SHIFT_DECLINED("Open Shift Declined"),
        LEAVE_SWAP_REQUEST("Leave Swap Request");
        
        private final String displayName;
        
        NotificationType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Related entity types enum
    public enum RelatedEntityType {
        SHIFT_ASSIGNMENT("shift_assignment"),
        LEAVE_REQUEST("leave_request"),
        SHIFT_SWAP("shift_swap"),
        OPEN_SHIFT_REQUEST("open_shift_request"),
        OPEN_SHIFT_ASSIGNMENT("open_shift_assignment");
        
        private final String value;
        
        RelatedEntityType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}
