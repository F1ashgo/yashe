package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.Review;
import com.yashe.mapper.ReviewMapper;
import com.yashe.config.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewMapper reviewMapper;

    public ReviewController(ReviewMapper reviewMapper) {
        this.reviewMapper = reviewMapper;
    }

    /* 提交评价 */
    @PostMapping
    public ResponseEntity<ApiResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestBody Review review
    ) {
        if (review.getProject() == null || review.getProject().isBlank()
            || review.getContent() == null || review.getContent().isBlank()
            || review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "评价内容不完整"));
        }
        review.setUserId(principal.userId());
        reviewMapper.insert(review);
        return ResponseEntity.ok(ApiResponse.success("评价提交成功"));
    }

    /* 我的评价 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> my(@AuthenticationPrincipal AuthenticatedUser principal) {
        List<Review> list = reviewMapper.findByUserId(principal.userId());
        return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
    }
}
