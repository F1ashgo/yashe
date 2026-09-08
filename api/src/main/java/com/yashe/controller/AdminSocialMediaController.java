package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.SocialMediaItem;
import com.yashe.mapper.SocialMediaItemMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/social-media")
public class AdminSocialMediaController {
    private static final Set<String> ALLOWED_PLATFORMS = Set.of("douyin", "xiaohongshu", "wechat-channel");
    private static final long MAX_UPLOAD_BYTES = 5L * 1024 * 1024;

    private final SocialMediaItemMapper socialMediaItemMapper;
    private final Path uploadDir;

    public AdminSocialMediaController(
        SocialMediaItemMapper socialMediaItemMapper,
        @Value("${app.upload-dir:./uploads}") String uploadDir
    ) {
        this.socialMediaItemMapper = socialMediaItemMapper;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping
    public ResponseEntity<ApiResponse> list(@RequestParam(required = false) String platform) {
        List<SocialMediaItem> list = socialMediaItemMapper.findAll();
        if (platform != null && !platform.isBlank()) {
            list = list.stream().filter(i -> platform.equals(i.getPlatform())).toList();
        }
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@RequestBody SocialMediaItem item) {
        ResponseEntity<ApiResponse> validation = validate(item);
        if (validation != null) return validation;
        normalize(item);
        socialMediaItemMapper.insert(item);
        return ResponseEntity.ok(ApiResponse.success("创建成功").put("id", item.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(
        @PathVariable Long id,
        @RequestBody SocialMediaItem item
    ) {
        ResponseEntity<ApiResponse> validation = validate(item);
        if (validation != null) return validation;
        normalize(item);
        item.setId(id);
        if (socialMediaItemMapper.update(item) == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "条目不存在"));
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
        if (socialMediaItemMapper.updateStatus(id, status) == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "条目不存在"));
        }
        return ResponseEntity.ok(ApiResponse.success("状态已更新"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        SocialMediaItem item = socialMediaItemMapper.findById(id);
        if (item == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "条目不存在"));
        }
        socialMediaItemMapper.deleteById(id);
        if (item.getImage() != null && socialMediaItemMapper.countByImage(item.getImage()) == 0) {
            deleteImageFile(item.getImage());
        }
        return ResponseEntity.ok(ApiResponse.success("删除成功"));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse> reorder(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "排序列表为空"));
        }
        for (int i = 0; i < ids.size(); i++) {
            socialMediaItemMapper.updateSortOrder(ids.get(i), i + 1);
        }
        return ResponseEntity.ok(ApiResponse.success("排序已更新"));
    }

    private void deleteImageFile(String image) {
        if (image == null || !image.startsWith("/api/uploads/")) return;
        String relative = image.substring("/api/uploads/".length());
        if (relative.isBlank()) return;
        try {
            Path resolved = uploadDir.resolve(relative).normalize();
            if (!resolved.startsWith(uploadDir)) return; // 防止路径穿越
            Files.deleteIfExists(resolved);
        } catch (IOException ignored) {
            // 删除失败时保留文件（尽力而为）
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "platform", required = false) String platform
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "未选择文件"));
        }
        platform = platform == null ? null : platform.trim();
        if (platform == null || !ALLOWED_PLATFORMS.contains(platform)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "平台无效"));
        }
        String ext = switch (file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> null;
        };
        if (ext == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "仅支持 jpg/png/webp 图片"));
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "图片不能超过 5MB"));
        }
        String filename = UUID.randomUUID().toString() + ext;
        try {
            Path dir = uploadDir.resolve(platform);
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error(500, "上传失败"));
        }
        return ResponseEntity.ok(ApiResponse.success("上传成功").put("url", "/api/uploads/" + platform + "/" + filename));
    }

    private ResponseEntity<ApiResponse> validate(SocialMediaItem item) {
        if (item.getPlatform() == null || !ALLOWED_PLATFORMS.contains(item.getPlatform())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "平台无效"));
        }
        if (item.getImage() == null || item.getImage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "图片不能为空"));
        }
        if (item.getCaption() == null || item.getCaption().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "说明文字不能为空"));
        }
        if (item.getCaption().length() > 255 || (item.getUrl() != null && item.getUrl().length() > 500)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "内容过长"));
        }
        return null;
    }

    private void normalize(SocialMediaItem item) {
        item.setPlatform(item.getPlatform().trim());
        item.setImage(item.getImage().trim());
        item.setCaption(item.getCaption().trim());
        if (item.getUrl() != null) {
            item.setUrl(item.getUrl().trim().isEmpty() ? null : item.getUrl().trim());
        }
        if (item.getSortOrder() == null || item.getSortOrder() < 1) {
            Integer max = socialMediaItemMapper.findMaxSortOrder(item.getPlatform());
            item.setSortOrder((max == null ? 0 : max) + 1);
        }
        if (item.getStatus() == null) {
            item.setStatus(1);
        } else if (item.getStatus() != 0 && item.getStatus() != 1) {
            item.setStatus(1);
        }
    }
}
