package com.yashe.config;

import com.yashe.entity.User;
import com.yashe.mapper.UserMapper;
import com.yashe.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserMapper userMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || authorization.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!authorization.regionMatches(true, 0, "Bearer ", 0, 7)
            || authorization.substring(7).isBlank()) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtUtil.parseAndValidateAccessToken(authorization.substring(7).trim());
            Long userId = claims.get("userId", Long.class);
            Integer tokenVersion = claims.get("tokenVersion", Integer.class);
            User user = userMapper.findById(userId);
            if (user != null
                && Integer.valueOf(1).equals(user.getStatus())
                && Objects.equals(user.getTokenVersion(), tokenVersion)) {
                AuthenticatedUser principal = new AuthenticatedUser(
                    user.getId(), user.getEmail(), user.getRole(), user.getTokenVersion()
                );
                var authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase(Locale.ROOT)))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
