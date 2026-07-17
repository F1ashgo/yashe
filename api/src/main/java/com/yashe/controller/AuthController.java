package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.dto.LoginRequest;
import com.yashe.dto.RegisterRequest;
import com.yashe.entity.User;
import com.yashe.config.AuthenticatedUser;
import com.yashe.service.UserService;
import com.yashe.service.RequestProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final RequestProtectionService protection;

    public AuthController(UserService userService, RequestProtectionService protection) {
        this.userService = userService;
        this.protection = protection;
    }

    /* 注册 */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
        @Valid @RequestBody RegisterRequest req,
        HttpServletRequest request
    ) {
        if (!protection.allow(request, "register", 3, Duration.ofMinutes(1))) {
            return ResponseEntity.status(429).header("Retry-After", "60")
                .body(ApiResponse.error(429, "请求过于频繁，请稍后再试"));
        }
        try {
            String token = userService.register(req);
            return ResponseEntity.ok(
                ApiResponse.success("注册成功").put("token", token)
            );

//            catch (RuntimeException E)
//

        } catch (RuntimeException e) {
            e.printStackTrace();
            String message = "该邮箱已被注册".equals(e.getMessage()) ? e.getMessage() : "注册失败，请稍后再试";
            return ResponseEntity.badRequest().body(
                ApiResponse.error(400, message)
            );
        }
    }


    /* 登录 */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
        @Valid @RequestBody LoginRequest req,
        HttpServletRequest request
    ) {
        if (!protection.allow(request, "login", 5, Duration.ofMinutes(1))) {
            return ResponseEntity.status(429).header("Retry-After", "60")
                .body(ApiResponse.error(429, "登录尝试过于频繁，请稍后再试"));
        }
        try {
            String token = userService.login(req);
            return ResponseEntity.ok(
                ApiResponse.success("登录成功").put("token", token)
            );
        } catch (RuntimeException e) {
            e.printStackTrace();
            String message = "该账号已被禁用".equals(e.getMessage()) ? e.getMessage() : "邮箱或密码错误";
            return ResponseEntity.status(401).body(
                ApiResponse.error(401, message)
            );
        }
    }

    /* 获取当前用户信息 */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        User user = userService.getCurrentUser(principal.userId());
        return ResponseEntity.ok(
            ApiResponse.success("OK")
                .put("id", user.getId())
                .put("name", user.getName())
                .put("email", user.getEmail())
                .put("phone", user.getPhone())
                .put("role", user.getRole())
        );
    }
}
