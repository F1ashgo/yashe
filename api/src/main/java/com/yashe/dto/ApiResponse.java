package com.yashe.dto;

import java.util.HashMap;
import java.util.Map;

public class ApiResponse {
    private int code;
    private String message;
    private Map<String, Object> data;

    private ApiResponse(int code, String message) {
        this.code = code;
        this.message = message;
        this.data = new HashMap<>();
    }

    public static ApiResponse success(String message) {
        return new ApiResponse(200, message);
    }

    public static ApiResponse error(int code, String message) {
        return new ApiResponse(code, message);
    }

    public ApiResponse put(String key, Object value) {
        this.data.put(key, value);
        return this;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
    public Map<String, Object> getData() { return data; }
}
