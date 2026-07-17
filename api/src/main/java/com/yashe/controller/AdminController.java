package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.User;
import com.yashe.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;

    public AdminController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }


    /* 统计概览 */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> stats() {
        int total = userMapper.countAll();
        int today = userMapper.countToday();
        return ResponseEntity.ok(ApiResponse.success("OK")
            .put("total", total).put("today", today));
    }

    /* 会员列表（支持搜索） */
    @GetMapping("/members")
    public ResponseEntity<ApiResponse> members(
        @RequestParam(defaultValue = "") String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        if (page < 1 || size < 1 || size > 100) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "分页参数无效"));
        }
        int safePage = page;
        int safeSize = size;
        String safeKeyword = keyword == null ? "" : keyword.trim();
        long rawOffset = (long) (safePage - 1) * safeSize;
        if (rawOffset > Integer.MAX_VALUE) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "分页范围过大"));
        }
        int offset = (int) rawOffset;
        List<User> list;
        int total;
        if (safeKeyword.isEmpty()) {
            list = userMapper.findAll(offset, safeSize);
            total = userMapper.countAll();
        } else {
            list = userMapper.searchByEmail(safeKeyword, offset, safeSize);
            total = userMapper.countSearch(safeKeyword);
        }
        // 隐藏密码
        for (User u : list) u.setPassword(null);

        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);
        data.put("page", safePage);
        data.put("size", safeSize);
        return ResponseEntity.ok(ApiResponse.success("OK").put("data", data));
    }
}


/*
*       data.put("list, list);
*       data.put("total", total);*/