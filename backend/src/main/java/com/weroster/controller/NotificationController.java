package com.weroster.controller;

import com.weroster.entity.Notification;
import com.weroster.entity.User;
import com.weroster.repository.StaffRepository;
import com.weroster.repository.UserRepository;
import com.weroster.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "Direct") String filter,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        
        try {
            // Get current user (for now, using test user)
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get staff member linked to this user (for validation)
            staffRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
            
            // Get notifications
            List<Notification> notifications = notificationService.getNotificationsForUser(currentUser.getId(), limit, offset);
            
            // Get unread count
            long unreadCount = notificationService.getUnreadCountForUser(currentUser.getId());
            
            // Convert to DTO format
            List<Map<String, Object>> notificationDtos = notifications.stream()
                .map(this::convertToDto)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notificationDtos);
            response.put("totalCount", notifications.size());
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get notifications: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch notifications: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        try {
            // Get current user
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get staff member (for validation)
            staffRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
            
            long unreadCount = notificationService.getUnreadCountForUser(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", unreadCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get unread count: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch unread count: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long notificationId) {
        try {
            // Get current user
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get staff member (for validation)
            staffRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
            
            boolean success = notificationService.markNotificationAsRead(notificationId, currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to mark notification as read: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark notification as read: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        try {
            // Get current user
            User currentUser = userRepository.findByDomainAndEmail("test", "test@example.com")
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get staff member (for validation)
            staffRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));
            
            int markedCount = notificationService.markAllNotificationsAsRead(currentUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("markedCount", markedCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to mark all notifications as read: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark all notifications as read: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, Object> convertToDto(Notification notification) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", notification.getId().toString());
        dto.put("type", notification.getType());
        dto.put("title", notification.getTitle());
        dto.put("message", notification.getMessage());
        dto.put("timestamp", notification.getCreatedAt().toString());
        dto.put("isRead", notification.getIsRead());
        
        // Add avatar initials
        if (notification.getTriggeredBy() != null && 
            notification.getTriggeredBy().getStaff() != null &&
            notification.getTriggeredBy().getStaff().getFirstName() != null &&
            notification.getTriggeredBy().getStaff().getLastName() != null) {
            String initials = getInitials(notification.getTriggeredBy().getStaff().getFirstName(), 
                                        notification.getTriggeredBy().getStaff().getLastName());
            dto.put("initials", initials);
        } else {
            dto.put("initials", "SYS");
        }
        
        // Add metadata
        Map<String, Object> metadata = new HashMap<>();
        if (notification.getRelatedEntityType() != null) {
            metadata.put("relatedEntityType", notification.getRelatedEntityType());
        }
        if (notification.getRelatedEntityId() != null) {
            metadata.put("relatedEntityId", notification.getRelatedEntityId());
        }
        if (notification.getTriggeredBy() != null && 
            notification.getTriggeredBy().getStaff() != null &&
            notification.getTriggeredBy().getStaff().getFirstName() != null &&
            notification.getTriggeredBy().getStaff().getLastName() != null) {
            metadata.put("triggeredBy", notification.getTriggeredBy().getStaff().getFirstName() + " " + 
                        notification.getTriggeredBy().getStaff().getLastName());
        }
        dto.put("metadata", metadata);
        
        return dto;
    }
    
    private String getInitials(String firstName, String lastName) {
        String first = firstName != null && !firstName.isEmpty() ? firstName.substring(0, 1).toUpperCase() : "";
        String last = lastName != null && !lastName.isEmpty() ? lastName.substring(0, 1).toUpperCase() : "";
        return first + last;
    }
}
