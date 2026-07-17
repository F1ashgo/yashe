package com.yashe.util;

import com.yashe.config.JwtProperties;
import com.yashe.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {
    private final JwtProperties properties;
    private final SecretKey key;

    public JwtUtil(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant issuedAt = Instant.now();
        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .issuer(properties.issuer())
            .audience().add(properties.audience()).and()
            .id(UUID.randomUUID().toString())
            .claim("token_type", "access")
            .claim("userId", user.getId())
            .claim("tokenVersion", user.getTokenVersion() == null ? 0 : user.getTokenVersion())
            .issuedAt(Date.from(issuedAt))
            .expiration(Date.from(issuedAt.plus(properties.expiration())))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }

    public Claims parseAndValidateAccessToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .requireIssuer(properties.issuer())
            .requireAudience(properties.audience())
            .require("token_type", "access")
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claims;
    }

    public Long getUserId(Claims claims) {
        return claims.get("userId", Long.class);
    }

    public Integer getTokenVersion(Claims claims) {
        return claims.get("tokenVersion", Integer.class);
    }
}
