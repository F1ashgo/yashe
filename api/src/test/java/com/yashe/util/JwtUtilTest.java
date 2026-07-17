package com.yashe.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.yashe.config.JwtProperties;
import com.yashe.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private static final String SECRET = "0123456789abcdef0123456789abcdef"; // gitleaks:allow

    private JwtUtil jwtUtil;
    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(new JwtProperties(SECRET, Duration.ofMinutes(60), "yashe-api", "yashe-web"));
        user = new User();
        user.setId(42L);
        user.setEmail("member@example.test");
        user.setRole("admin");
        user.setTokenVersion(7);
    }

    @Test
    void generatesValidatedAccessTokenWithoutRoleAuthority() {
        String first = jwtUtil.generateAccessToken(user);
        String second = jwtUtil.generateAccessToken(user);
        Claims claims = jwtUtil.parseAndValidateAccessToken(first);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.getIssuer()).isEqualTo("yashe-api");
        assertThat(claims.getAudience()).containsExactly("yashe-web");
        assertThat(claims.get("token_type", String.class)).isEqualTo("access");
        assertThat(claims.get("userId", Long.class)).isEqualTo(42L);
        assertThat(claims.get("tokenVersion", Integer.class)).isEqualTo(7);
        assertThat(claims.get("role")).isNull();
        assertThat(claims.getId()).isNotBlank();
        assertThat(jwtUtil.parseAndValidateAccessToken(second).getId()).isNotEqualTo(claims.getId());
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime())
                .isEqualTo(Duration.ofMinutes(60).toMillis());
    }

    @Test
    void rejectsWrongSignatureIssuerAndAudience() {
        String token = jwtUtil.generateAccessToken(user);

        JwtUtil wrongSignature = new JwtUtil(new JwtProperties(
                "fedcba9876543210fedcba9876543210", Duration.ofMinutes(60), "yashe-api", "yashe-web"));
        JwtUtil wrongIssuer = new JwtUtil(new JwtProperties(
                SECRET, Duration.ofMinutes(60), "other-api", "yashe-web"));
        JwtUtil wrongAudience = new JwtUtil(new JwtProperties(
                SECRET, Duration.ofMinutes(60), "yashe-api", "other-web"));

        assertThatThrownBy(() -> wrongSignature.parseAndValidateAccessToken(token)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> wrongIssuer.parseAndValidateAccessToken(token)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> wrongAudience.parseAndValidateAccessToken(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void rejectsSecretsShorterThanHs256Minimum() {
        assertThatThrownBy(() -> new JwtProperties("too-short", Duration.ofMinutes(60), "yashe-api", "yashe-web"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("32 bytes");
    }
}
