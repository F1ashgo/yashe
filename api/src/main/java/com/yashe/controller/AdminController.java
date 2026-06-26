package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.User;
import com.yashe.mapper.UserMapper;
import com.yashe.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public AdminController(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    /* 校验管理员身份 */
    private boolean isAdmin(String auth) {
        try {
            String token = auth.replace("Bearer ", "");
            String role = jwtUtil.parseToken(token).get("role", String.class);
            return "admin".equals(role);
        } catch (Exception e) {
            return false;
        }
    }

    /* 统计概览 */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> stats(@RequestHeader("Authorization") String auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        int total = userMapper.countAll();
        int today = userMapper.countToday();
        return ResponseEntity.ok(ApiResponse.success("OK")
            .put("total", total).put("today", today));
    }

    /* 会员列表（支持搜索） */
    @GetMapping("/members")
    public ResponseEntity<ApiResponse> members(
        @RequestHeader("Authorization") String auth,
        @RequestParam(defaultValue = "") String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(ApiResponse.error(403, "无权限"));
        int offset = (page - 1) * size;
        List<User> list;
        int total;
        if (keyword.isEmpty()) {
            list = userMapper.findAll(offset, size);
            total = userMapper.countAll();
        } else {
            list = userMapper.searchByEmail(keyword, offset, size);
            total = userMapper.countSearch(keyword);
        }
        // 隐藏密码
        for (User u : list) u.setPassword(null);

        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);
        data.put("page", page);
        data.put("size", size);
        return ResponseEntity.ok(ApiResponse.success("OK").put("data", data));
    }
}
