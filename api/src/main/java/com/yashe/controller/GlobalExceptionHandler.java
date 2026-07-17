package com.yashe.controller;

import com.yashe.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> validation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getDefaultMessage())
            .distinct()
            .collect(Collectors.joining("；"));
        return ResponseEntity.badRequest().body(ApiResponse.error(400, message));
    }

    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponse> badRequest(Exception exception) {
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "请求参数无效"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> unexpected(Exception exception) {
        LOG.error("Unhandled API error", exception);
        return ResponseEntity.internalServerError().body(ApiResponse.error(500, "服务器暂时无法处理请求"));
    }
}
