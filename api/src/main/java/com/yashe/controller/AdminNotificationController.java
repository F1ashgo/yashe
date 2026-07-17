package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.Notification;
import com.yashe.mapper.NotificationMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {
    private static final Set<String> ALLOWED_TYPES = Set.of("公告", "优惠", "设计提醒", "活动");

    private final NotificationMapper notificationMapper;

    public AdminNotificationController(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> list() {
        List<Notification> list = notificationMapper.findAll();
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@RequestBody Notification notification) {
        if (notification.getTitle() == null || notification.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知标题不能为空"));
        }
        if (notification.getContent() == null || notification.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知内容不能为空"));
        }
        notification.setTitle(notification.getTitle().trim());
        notification.setContent(notification.getContent().trim());
        if (notification.getTitle().length() > 120 || notification.getContent().length() > 5000) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知内容过长"));
        }
        if (notification.getType() == null || notification.getType().trim().isEmpty()) {
            notification.setType("公告");
        }
        if (!ALLOWED_TYPES.contains(notification.getType())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知类型无效"));
        }
        if (notification.getStatus() == null) {
            notification.setStatus(1);
        }
        if (notification.getStatus() != 0 && notification.getStatus() != 1) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "状态值无效"));
        }
        notificationMapper.insert(notification);
        return ResponseEntity.ok(ApiResponse.success("创建成功").put("id", notification.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(
        @PathVariable Long id,
        @RequestBody Notification notification
    ) {
        if (notification.getTitle() == null || notification.getTitle().isBlank()
            || notification.getContent() == null || notification.getContent().isBlank()
            || notification.getType() == null || !ALLOWED_TYPES.contains(notification.getType())
            || notification.getStatus() == null || (notification.getStatus() != 0 && notification.getStatus() != 1)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "通知参数无效"));
        }
        notification.setId(id);
        if (notificationMapper.update(notification) == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "通知不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success("更新成功"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
        @PathVariable Long id,
        @RequestParam Integer status
    ) {
        if (status == null || (status != 0 && status != 1)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "状态值无效"));
        }
        if (notificationMapper.updateStatus(id, status) == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "通知不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success("状态已更新"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        if (notificationMapper.deleteById(id) == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "通知不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success("删除成功"));
    }
}
