package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.Notification;
import com.yashe.mapper.NotificationMapper;
import com.yashe.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationMapper notificationMapper;
    private final JwtUtil jwtUtil;

    public AdminNotificationController(NotificationMapper notificationMapper, JwtUtil jwtUtil) {
        this.notificationMapper = notificationMapper;
        this.jwtUtil = jwtUtil;
    }

    private boolean isAdmin(String auth) {
        try {
            String token = auth.replace("Bearer ", "");
            String role = jwtUtil.parseToken(token).get("role", String.class);
            return "admin".equals(role);
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> list(@RequestHeader("Authorization") String auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        List<Notification> list = notificationMapper.findAll();
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(
        @RequestHeader("Authorization") String auth,
        @RequestBody Notification notification
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        if (notification.getTitle() == null || notification.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知标题不能为空"));
        }
        if (notification.getContent() == null || notification.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知内容不能为空"));
        }
        if (notification.getType() == null || notification.getType().trim().isEmpty()) {
            notification.setType("公告");
        }
        if (notification.getStatus() == null) {
            notification.setStatus(1);
        }
        notificationMapper.insert(notification);
        return ResponseEntity.ok(ApiResponse.success("创建成功").put("id", notification.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(
        @RequestHeader("Authorization") String auth,
        @PathVariable Long id,
        @RequestBody Notification notification
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        notification.setId(id);
        notificationMapper.update(notification);
        return ResponseEntity.ok(ApiResponse.success("更新成功"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
        @RequestHeader("Authorization") String auth,
        @PathVariable Long id,
        @RequestParam Integer status
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        notificationMapper.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("状态已更新"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
        @RequestHeader("Authorization") String auth,
        @PathVariable Long id
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        notificationMapper.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("删除成功"));
    }
}
