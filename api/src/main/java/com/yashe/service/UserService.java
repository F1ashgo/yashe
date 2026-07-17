package com.yashe.service;

import com.yashe.dto.LoginRequest;
import com.yashe.dto.RegisterRequest;
import com.yashe.entity.User;
import com.yashe.mapper.UserMapper;
import com.yashe.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    public UserService(UserMapper userMapper, JwtUtil jwtUtil, BCryptPasswordEncoder encoder) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
        this.encoder = encoder;
    }

    /* 注册 */
    public String register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);
        // 检查邮箱是否已注册
        User exist = userMapper.findByEmail(email);
        if (exist != null) {
            throw new RuntimeException("该邮箱已被注册");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPhone(blankToNull(req.getPhone()));
        user.setPassword(encoder.encode(req.getPassword()));
        user.setPromoCode(blankToNull(req.getPromoCode()));
        user.setRole("member");
        user.setStatus(1);
        user.setTokenVersion(0);

        userMapper.insert(user);

        // 返回 JWT
        return jwtUtil.generateAccessToken(user);
    }

    /* 登录 */
    public String login(LoginRequest req) {
        User user = userMapper.findByEmail(req.getEmail().trim().toLowerCase(Locale.ROOT));
        if (user == null) {
            throw new RuntimeException("邮箱或密码错误");
        }
        if (user.getStatus() == 0) {
            throw new RuntimeException("该账号已被禁用");
        }

        String rawPassword = req.getPassword();
        String dbPassword = user.getPassword();
        boolean passwordMatches = false;

        // 判断是否是符合 BCrypt 格式的哈希串
        if (dbPassword != null && (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$"))) {
            passwordMatches = encoder.matches(rawPassword, dbPassword);
        } else {
            // 支持明文密码（兼容手动或旧脚本直接写入明文的情况）
            passwordMatches = rawPassword != null && rawPassword.equals(dbPassword);
            if (passwordMatches) {
                // 登录成功后，自动升级为 BCrypt 加密存储以保障安全性
                userMapper.updatePassword(user.getId(), encoder.encode(rawPassword));
            }
        }

        if (!passwordMatches) {
            throw new RuntimeException("邮箱或密码错误");
        }

        return jwtUtil.generateAccessToken(user);
    }

    /* 获取当前用户 */
    public User getCurrentUser(Long userId) {
        User user = userMapper.findById(userId);
        if (user != null) {
            user.setPassword(null); // 不返回密码
        }
        return user;
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}
