package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.dto.ContactRequest;
import com.yashe.mapper.ContactMapper;
import com.yashe.service.RequestProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMapper contactMapper;
    private final RequestProtectionService protection;

    public ContactController(ContactMapper contactMapper, RequestProtectionService protection) {
        this.contactMapper = contactMapper;
        this.protection = protection;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse> send(
        @Valid @RequestBody ContactRequest msg,
        HttpServletRequest request
    ) {
        if (!protection.allow(request, "contact", 3, Duration.ofMinutes(1))) {
            return ResponseEntity.status(429).header("Retry-After", "60")
                .body(ApiResponse.error(429, "留言过于频繁，请稍后再试"));
        }
        contactMapper.insert(msg.toEntity());
        return ResponseEntity.ok(ApiResponse.success("感谢您的留言，我们将在24小时内与您联系！"));
    }
}
