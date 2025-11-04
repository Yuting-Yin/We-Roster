package com.weroster.repository;

import com.weroster.entity.Notification;
import com.weroster.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific user
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.triggeredBy t LEFT JOIN FETCH t.staff WHERE n.recipient = :recipient ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient);
    
    // Find notifications for a specific user with pagination
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.triggeredBy t LEFT JOIN FETCH t.staff WHERE n.recipient = :recipient ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient, Pageable pageable);
    
    // Find unread notifications for a specific user
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
    
    // Count unread notifications for a specific user
    long countByRecipientAndIsReadFalse(User recipient);
    
    // Find notifications by type for a specific user
    List<Notification> findByRecipientAndTypeOrderByCreatedAtDesc(User recipient, String type);
    
    // Find notifications within a date range
    List<Notification> findByRecipientAndCreatedAtBetweenOrderByCreatedAtDesc(
        User recipient, LocalDateTime startDate, LocalDateTime endDate);
    
    // Mark notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    int markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
    
    // Mark all notifications as read for a specific user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient = :recipient AND n.isRead = false")
    int markAllAsRead(@Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
    
    // Find notifications by related entity
    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String relatedEntityType, Long relatedEntityId);
    
    // Delete old notifications (for cleanup)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find notifications by multiple recipients (for team notifications)
    List<Notification> findByRecipientInOrderByCreatedAtDesc(List<User> recipients);
}
