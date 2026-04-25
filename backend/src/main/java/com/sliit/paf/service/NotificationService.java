package com.sliit.paf.service;

import com.sliit.paf.model.Notification;
import com.sliit.paf.model.NotificationStatus;
import com.sliit.paf.model.NotificationType;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.NotificationRepository;
import com.sliit.paf.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createForUser(String userId,
                                      Role recipientRole,
                                      String title,
                                      String message,
                                      NotificationType type,
                                      String referenceType,
                                      String referenceId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setRecipientRole(recipientRole);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void createForRole(Role role,
                              String title,
                              String message,
                              NotificationType type,
                              String referenceType,
                              String referenceId,
                              Set<String> excludedUserIds) {
        Set<String> exclude = excludedUserIds == null ? Set.of() : excludedUserIds;
        List<User> recipients = userRepository.findAllByRolesContaining(role);

        for (User recipient : recipients) {
            if (exclude.contains(recipient.getId())) {
                continue;
            }

            createForUser(
                    recipient.getId(),
                    role,
                    title,
                    message,
                    type,
                    referenceType,
                    referenceId);
        }
    }

    public void createForParticipants(List<User> participants,
                                      String title,
                                      String message,
                                      NotificationType type,
                                      String referenceType,
                                      String referenceId,
                                      Set<String> excludedUserIds) {
        Set<String> seen = new HashSet<>();
        Set<String> exclude = excludedUserIds == null ? Set.of() : excludedUserIds;

        for (User participant : participants) {
            if (participant == null || participant.getId() == null || participant.getId().isBlank()) {
                continue;
            }
            if (exclude.contains(participant.getId()) || !seen.add(participant.getId())) {
                continue;
            }

            createForUser(
                    participant.getId(),
                    getPrimaryRole(participant),
                    title,
                    message,
                    type,
                    referenceType,
                    referenceId);
        }
    }

    public Page<Notification> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You cannot update this notification.");
        }

        notification.setStatus(NotificationStatus.READ);
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        Page<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(
                userId,
                Pageable.unpaged());

        notifications.forEach(notification -> {
            notification.setStatus(NotificationStatus.READ);
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void clearAllNotifications(String userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    private Role getPrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return Role.USER;
        }

        if (user.getRoles().contains(Role.ADMIN)) {
            return Role.ADMIN;
        }

        if (user.getRoles().contains(Role.TECHNICIAN)) {
            return Role.TECHNICIAN;
        }

        return Role.USER;
    }
}
