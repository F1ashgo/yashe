package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.ContactMessage;
import com.yashe.mapper.ContactMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMapper contactMapper;

    public ContactController(ContactMapper contactMapper) {
        this.contactMapper = contactMapper;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse> send(@Valid @RequestBody ContactMessage msg) {
        contactMapper.insert(msg);
        return ResponseEntity.ok(ApiResponse.success("感谢您的留言，我们将在24小时内与您联系！"));
    }
}
