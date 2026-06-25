package com.yashe.service;

import com.yashe.dto.LoginRequest;
import com.yashe.dto.RegisterRequest;
import com.yashe.entity.User;
import com.yashe.mapper.UserMapper;
import com.yashe.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
        // 检查邮箱是否已注册
        User exist = userMapper.findByEmail(req.getEmail());
        if (exist != null) {
            throw new RuntimeException("该邮箱已被注册");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setPromoCode(req.getPromoCode());
        user.setRole("member");
        user.setStatus(1);

        userMapper.insert(user);

        // 返回 JWT
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
    }

    /* 登录 */
    public String login(LoginRequest req) {
        User user = userMapper.findByEmail(req.getEmail());
        if (user == null) {
            throw new RuntimeException("邮箱或密码错误");
        }
        if (user.getStatus() == 0) {
            throw new RuntimeException("该账号已被禁用");
        }
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("邮箱或密码错误");
        }

        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
    }

    /* 获取当前用户 */
    public User getCurrentUser(Long userId) {
        User user = userMapper.findById(userId);
        if (user != null) {
            user.setPassword(null); // 不返回密码
        }
        return user;
    }
}
