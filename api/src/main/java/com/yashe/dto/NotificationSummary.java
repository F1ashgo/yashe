package com.yashe.dto;

import com.yashe.entity.Notification;

import java.time.LocalDateTime;

public record NotificationSummary(
    String title,
    String content,
    String type,
    LocalDateTime createdAt
) {
    public static NotificationSummary from(Notification notification) {
        return new NotificationSummary(
            notification.getTitle(),
            notification.getContent(),
            notification.getType(),
            notification.getCreatedAt()
        );
    }
}
