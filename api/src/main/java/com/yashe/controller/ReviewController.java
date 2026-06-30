package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import com.yashe.entity.Review;
import com.yashe.mapper.ReviewMapper;
import com.yashe.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewMapper reviewMapper;
    private final JwtUtil jwtUtil;

    public ReviewController(ReviewMapper reviewMapper, JwtUtil jwtUtil) {
        this.reviewMapper = reviewMapper;
        this.jwtUtil = jwtUtil;
    }

    /* 提交评价 */
    @PostMapping
    public ResponseEntity<ApiResponse> create(@RequestHeader("Authorization") String auth, @RequestBody Review review) {
        try {
            Long userId = jwtUtil.getUserId(auth.replace("Bearer ", ""));
            review.setUserId(userId);
            reviewMapper.insert(review);
            return ResponseEntity.ok(ApiResponse.success("评价提交成功"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "请先登录"));
        }
    }

    /* 我的评价 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> my(@RequestHeader("Authorization") String auth) {
        try {
            Long userId = jwtUtil.getUserId(auth.replace("Bearer ", ""));
            List<Review> list = reviewMapper.findByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("OK").put("list", list));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "请先登录"));
        }
    }
}
