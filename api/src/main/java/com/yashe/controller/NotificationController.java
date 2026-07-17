package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.Notification;
import com.yashe.mapper.NotificationMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationMapper notificationMapper;

    public NotificationController(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse> latest(@RequestParam(defaultValue = "5") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 10));
        List<Notification> list = notificationMapper.findPublished(safeLimit);
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }
}
