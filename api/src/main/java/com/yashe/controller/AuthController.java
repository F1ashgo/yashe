package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.dto.LoginRequest;
import com.yashe.dto.RegisterRequest;
import com.yashe.entity.User;
import com.yashe.service.UserService;
import com.yashe.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /* 注册 */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest req) {
        try {
            String token = userService.register(req);
            return ResponseEntity.ok(
                ApiResponse.success("注册成功").put("token", token)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(400, e.getMessage())
            );
        }
    }

    /* 登录 */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest req) {
        try {
            String token = userService.login(req);
            return ResponseEntity.ok(
                ApiResponse.success("登录成功").put("token", token)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(400, e.getMessage())
            );
        }
    }

    /* 获取当前用户信息 */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(@RequestHeader("Authorization") String auth) {
        try {
            String token = auth.replace("Bearer ", "");
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(401).body(ApiResponse.error(401, "Token 无效"));
            }
            Long userId = jwtUtil.getUserId(token);
            User user = userService.getCurrentUser(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(ApiResponse.error(404, "用户不存在"));
            }
            return ResponseEntity.ok(
                ApiResponse.success("OK")
                    .put("id", user.getId())
                    .put("name", user.getName())
                    .put("email", user.getEmail())
                    .put("phone", user.getPhone())
                    .put("role", user.getRole())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "认证失败"));
        }
    }
}
