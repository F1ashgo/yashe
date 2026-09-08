package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.SocialMediaItem;
import com.yashe.mapper.SocialMediaItemMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-media")
public class SocialMediaController {

    private final SocialMediaItemMapper socialMediaItemMapper;

    public SocialMediaController(SocialMediaItemMapper socialMediaItemMapper) {
        this.socialMediaItemMapper = socialMediaItemMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> list(@RequestParam(defaultValue = "douyin") String platform) {
        List<SocialMediaItem> list = socialMediaItemMapper.findByPlatformPublished(platform);
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }
}
