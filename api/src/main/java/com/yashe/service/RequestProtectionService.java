package com.yashe.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RequestProtectionService {
    private static final URI VERIFY_URI =
        URI.create("https://challenges.cloudflare.com/turnstile/v0/siteverify");

    private final ConcurrentHashMap<String, Window> limits = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(4))
        .build();
    private final ObjectMapper objectMapper;
    private final String secret;

    public RequestProtectionService(
        ObjectMapper objectMapper,
        @Value("${app.turnstile.secret:}") String secret
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret;
    }

    public boolean allow(HttpServletRequest request, String scope, int maxRequests, Duration duration) {
        long now = System.currentTimeMillis();
        long windowMillis = duration.toMillis();
        String key = scope + ":" + clientIp(request);

        Window current = limits.compute(key, (ignored, existing) -> {
            if (existing == null || now - existing.startedAt >= windowMillis) {
                return new Window(now, 1);
            }
            return new Window(existing.startedAt, existing.count + 1);
        });

        if (limits.size() > 10_000) {
            limits.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= windowMillis);
        }
        return current.count <= maxRequests;
    }

    public boolean verifyTurnstile(String token, HttpServletRequest request, String expectedAction) {
        if (secret == null || secret.isBlank() || token == null || token.isBlank()) return false;
        try {
            String body = form("secret", secret)
                + "&" + form("response", token)
                + "&" + form("remoteip", clientIp(request));
            HttpRequest verifyRequest = HttpRequest.newBuilder(VERIFY_URI)
                .timeout(Duration.ofSeconds(6))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> response = httpClient.send(
                verifyRequest, HttpResponse.BodyHandlers.ofString()
            );
            if (response.statusCode() != 200) return false;
            TurnstileResult result = objectMapper.readValue(response.body(), TurnstileResult.class);
            return result.success && expectedAction.equals(result.action);
        } catch (Exception ignored) {
            return false;
        }
    }

    private String clientIp(HttpServletRequest request) {
        String cloudflareIp = request.getHeader("CF-Connecting-IP");
        String remoteAddress = request.getRemoteAddr();
        boolean trustedProxy = "127.0.0.1".equals(remoteAddress)
            || "0:0:0:0:0:0:0:1".equals(remoteAddress)
            || "::1".equals(remoteAddress);
        if (trustedProxy && cloudflareIp != null && !cloudflareIp.isBlank()) {
            return cloudflareIp.trim();
        }
        return remoteAddress;
    }

    private String form(String key, String value) {
        return URLEncoder.encode(key, StandardCharsets.UTF_8)
            + "=" + URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record Window(long startedAt, int count) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class TurnstileResult {
        public boolean success;
        public String action;
        @JsonProperty("error-codes")
        public List<String> errorCodes;
    }
}
