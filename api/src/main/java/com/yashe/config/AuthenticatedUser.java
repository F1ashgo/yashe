package com.yashe.config;

public record AuthenticatedUser(
    Long userId,
    String email,
    String role,
    Integer tokenVersion
) {}
