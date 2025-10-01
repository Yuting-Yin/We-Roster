package com.weroster.service;

import com.weroster.entity.*;
import com.weroster.repository.NotificationRepository;
import com.weroster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    // Create notification for event assignment
    public void createEventAssignmentNotification(ShiftAssignment assignment, Staff assignedBy) {
        String message = String.format("Event %s on %s - %s has been assigned to you by %s",
            assignment.getShift().getType(),
            formatDate(assignment.getShift().getStartTs()),
            getShiftTime(assignment.getShift().getStartTs()),
            getStaffName(assignedBy));
            
        createNotification(
            assignment.getStaff().getUser(),
            Notification.NotificationType.EVENT_ASSIGNMENT.name(),
            "Event Assignment",
            message,
            Notification.RelatedEntityType.SHIFT_ASSIGNMENT.getValue(),
            assignment.getId(),
            assignedBy.getUser()
        );
    }
    
    // Create notification for leave request approval
    public void createLeaveApprovalNotification(LeaveRequest leaveRequest, Staff approvedBy) {
        String message = String.format("Your leave on %s - %s has been approved by %s",
            formatDate(leaveRequest.getStartTime()),
            getShiftTime(leaveRequest.getStartTime()),
            getStaffName(approvedBy));
            
        createNotification(
            leaveRequest.getStaff().getUser(),
            Notification.NotificationType.LEAVE_APPROVAL.name(),
            "Leave Approved",
            message,
            Notification.RelatedEntityType.LEAVE_REQUEST.getValue(),
            leaveRequest.getId(),
            approvedBy.getUser()
        );
    }
    
    // Create notification for leave request decline
    public void createLeaveDeclineNotification(LeaveRequest leaveRequest, Staff declinedBy) {
        String message = String.format("Your leave on %s - %s has been declined by %s",
            formatDate(leaveRequest.getStartTime()),
            getShiftTime(leaveRequest.getStartTime()),
            getStaffName(declinedBy));
            
        createNotification(
            leaveRequest.getStaff().getUser(),
            Notification.NotificationType.LEAVE_DECLINED.name(),
            "Leave Declined",
            message,
            Notification.RelatedEntityType.LEAVE_REQUEST.getValue(),
            leaveRequest.getId(),
            declinedBy.getUser()
        );
    }
    
    // Create notification for swap request
    public void createSwapRequestNotification(ShiftSwap swapRequest) {
        String message = String.format("Swap request on %s - %s from %s",
            formatDate(swapRequest.getFromTime()),
            getShiftTime(swapRequest.getFromTime()),
            getStaffName(swapRequest.getRequester()));
            
        createNotification(
            swapRequest.getTarget().getUser(),
            Notification.NotificationType.SWAP_REQUEST.name(),
            "Swap Request",
            message,
            Notification.RelatedEntityType.SHIFT_SWAP.getValue(),
            swapRequest.getId(),
            swapRequest.getRequester().getUser()
        );
    }
    
    // Create notification for swap approval
    public void createSwapApprovalNotification(ShiftSwap swapRequest, Staff approvedBy) {
        String message = String.format("Your swap request on %s - %s has been approved by %s",
            formatDate(swapRequest.getFromTime()),
            getShiftTime(swapRequest.getFromTime()),
            getStaffName(approvedBy));
            
        createNotification(
            swapRequest.getRequester().getUser(),
            Notification.NotificationType.SWAP_APPROVED.name(),
            "Swap Approved",
            message,
            Notification.RelatedEntityType.SHIFT_SWAP.getValue(),
            swapRequest.getId(),
            approvedBy.getUser()
        );
    }
    
    // Create notification for swap decline
    public void createSwapDeclineNotification(ShiftSwap swapRequest, Staff declinedBy) {
        String message = String.format("Your swap request on %s - %s has been declined by %s",
            formatDate(swapRequest.getFromTime()),
            getShiftTime(swapRequest.getFromTime()),
            getStaffName(declinedBy));
            
        createNotification(
            swapRequest.getRequester().getUser(),
            Notification.NotificationType.SWAP_DECLINED.name(),
            "Swap Declined",
            message,
            Notification.RelatedEntityType.SHIFT_SWAP.getValue(),
            swapRequest.getId(),
            declinedBy.getUser()
        );
    }
    
    // Create notification for open shift application approval
    public void createOpenShiftApprovalNotification(OpenShiftRequest openShiftRequest, Staff approvedBy) {
        String message = String.format("Your application for open shift on %s - %s has been approved by %s",
            formatDate(openShiftRequest.getOpenShift().getStartTs()),
            getShiftTime(openShiftRequest.getOpenShift().getStartTs()),
            getStaffName(approvedBy));
            
        createNotification(
            openShiftRequest.getStaff().getUser(),
            Notification.NotificationType.OPEN_SHIFT_APPROVED.name(),
            "Open Shift Approved",
            message,
            Notification.RelatedEntityType.OPEN_SHIFT_REQUEST.getValue(),
            openShiftRequest.getId(),
            approvedBy.getUser()
        );
    }
    
    // Create notification for open shift application decline
    public void createOpenShiftDeclineNotification(OpenShiftRequest openShiftRequest, Staff declinedBy) {
        String message = String.format("Your application for open shift on %s - %s has been declined by %s",
            formatDate(openShiftRequest.getOpenShift().getStartTs()),
            getShiftTime(openShiftRequest.getOpenShift().getStartTs()),
            getStaffName(declinedBy));
            
        createNotification(
            openShiftRequest.getStaff().getUser(),
            Notification.NotificationType.OPEN_SHIFT_DECLINED.name(),
            "Open Shift Declined",
            message,
            Notification.RelatedEntityType.OPEN_SHIFT_REQUEST.getValue(),
            openShiftRequest.getId(),
            declinedBy.getUser()
        );
    }
    
    // Create notification for leave swap request (when someone wants to swap for your shift)
    public void createLeaveSwapRequestNotification(LeaveRequest leaveRequest, Staff currentShiftHolder) {
        String message = String.format("Leave swap request for your shift on %s - %s from %s",
            formatDate(leaveRequest.getStartTime()),
            getShiftTime(leaveRequest.getStartTime()),
            getStaffName(leaveRequest.getStaff()));
            
        createNotification(
            currentShiftHolder.getUser(),
            Notification.NotificationType.LEAVE_SWAP_REQUEST.name(),
            "Leave Swap Request",
            message,
            Notification.RelatedEntityType.LEAVE_REQUEST.getValue(),
            leaveRequest.getId(),
            leaveRequest.getStaff().getUser()
        );
    }
    
    // Generic notification creation method
    private void createNotification(User recipient, String type, String title, String message, 
                                  String relatedEntityType, Long relatedEntityId, User triggeredBy) {
        try {
            Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .triggeredBy(triggeredBy)
                .build();
                
            notificationRepository.save(notification);
            log.info("Created notification for user {}: {}", recipient.getId(), title);
        } catch (Exception e) {
            log.error("Failed to create notification for user {}: {}", recipient.getId(), e.getMessage());
        }
    }
    
    // Get notifications for a user
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(Long userId, int limit, int offset) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return List.of();
        }
        
        Pageable pageable = PageRequest.of(offset / limit, limit);
        Page<Notification> page = notificationRepository.findByRecipientOrderByCreatedAtDesc(user.get(), pageable);
        return page.getContent();
    }
    
    // Get unread count for a user
    @Transactional(readOnly = true)
    public long getUnreadCountForUser(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return 0;
        }
        
        return notificationRepository.countByRecipientAndIsReadFalse(user.get());
    }
    
    // Mark notification as read
    public boolean markNotificationAsRead(Long notificationId, Long userId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isEmpty() || !notification.get().getRecipient().getId().equals(userId)) {
            return false;
        }
        
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
        return true;
    }
    
    // Mark all notifications as read for a user
    public int markAllNotificationsAsRead(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return 0;
        }
        
        return notificationRepository.markAllAsRead(user.get(), LocalDateTime.now());
    }
    
    // Helper methods
    private String formatDate(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("EEE, dd MMM yyyy"));
    }
    
    private String getShiftTime(LocalDateTime dateTime) {
        int hour = dateTime.getHour();
        if (hour < 12) return "AM";
        else if (hour < 18) return "PM";
        else return "Night";
    }
    
    private String getStaffName(Staff staff) {
        if (staff == null) return "System";
        return staff.getFirstName() + " " + staff.getLastName();
    }
}
