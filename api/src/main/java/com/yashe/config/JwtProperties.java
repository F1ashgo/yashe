package com.yashe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, Duration expiration, String issuer, String audience) {
    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("YASHE_JWT_SECRET must contain at least 32 bytes");
        }
        if (expiration == null || expiration.isNegative() || expiration.isZero()) {
            throw new IllegalArgumentException("JWT expiration must be positive");
        }
        if (issuer == null || issuer.isBlank() || audience == null || audience.isBlank()) {
            throw new IllegalArgumentException("JWT issuer and audience are required");
        }
    }
}
