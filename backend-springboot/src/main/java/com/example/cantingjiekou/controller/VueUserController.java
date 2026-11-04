package com.example.cantingjiekou.controller;

import com.example.cantingjiekou.entity.VueUser;
import com.example.cantingjiekou.mapper.VueUserMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 商家后台用户控制器
 * 处理商家注册、登录业务
 */
@RestController
@RequestMapping("/api")
public class VueUserController {

    private static final Logger logger = LoggerFactory.getLogger(VueUserController.class);

    @Autowired
    private VueUserMapper vueUserMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DataSource dataSource;

    /**
     * 启动时自动创建 Vue_user 表（如果不存在）
     */
    @PostConstruct
    public void initTable() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS Vue_user (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    created_at DATETIME NOT NULL
                )
            """);
            logger.info("Vue_user 表已就绪");
        } catch (Exception e) {
            logger.error("创建 Vue_user 表失败：{}", e.getMessage());
        }
    }

    /**
     * 商家用户注册
     * POST /api/register
     */
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();

        try {
            String username = params.get("username");
            String password = params.get("password");
            String phone = params.get("phone");
            String email = params.get("email");
            String createdAtStr = params.get("created_at");

            // 参数校验
            if (username == null || username.trim().isEmpty()) {
                result.put("code", 400);
                result.put("message", "用户名不能为空");
                return result;
            }
            if (password == null || password.trim().isEmpty()) {
                result.put("code", 400);
                result.put("message", "密码不能为空");
                return result;
            }
            if (email == null || email.trim().isEmpty()) {
                result.put("code", 400);
                result.put("message", "邮箱不能为空");
                return result;
            }

            // 检查用户名是否已存在
            VueUser existByUsername = vueUserMapper.selectByUsername(username);
            if (existByUsername != null) {
                result.put("code", 409);
                result.put("message", "用户名已存在");
                return result;
            }

            // 检查邮箱是否已存在
            VueUser existByEmail = vueUserMapper.selectByEmail(email);
            if (existByEmail != null) {
                result.put("code", 409);
                result.put("message", "邮箱已被注册");
                return result;
            }

            // 加密密码
            String hashedPassword = passwordEncoder.encode(password);

            // 解析注册时间
            LocalDateTime createdAt = LocalDateTime.now();
            if (createdAtStr != null && !createdAtStr.isEmpty()) {
                try {
                    createdAt = LocalDateTime.parse(createdAtStr.replace("T", " ").substring(0, 19)
                            .replace("T", " "));
                    // 简单处理 ISO 格式
                    if (createdAtStr.contains("T")) {
                        createdAt = LocalDateTime.parse(createdAtStr.substring(0, 19));
                    }
                } catch (Exception e) {
                    // 解析失败使用当前时间
                }
            }

            // 构建用户对象
            VueUser user = VueUser.builder()
                    .username(username)
                    .password(hashedPassword)
                    .phone(phone != null ? phone : "")
                    .email(email)
                    .createdAt(createdAt)
                    .build();

            vueUserMapper.insert(user);
            logger.info("商家用户注册成功，username={}, userId={}", username, user.getId());

            result.put("code", 200);
            result.put("message", "用户注册成功");
            result.put("userId", user.getId());

        } catch (Exception e) {
            logger.error("商家用户注册失败：", e);
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
        }
        return result;
    }

    /**
     * 商家用户登录
     * POST /api/login
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();

        try {
            String username = params.get("username");
            String password = params.get("password");

            // 参数校验
            if (username == null || username.trim().isEmpty()) {
                result.put("code", 400);
                result.put("message", "用户名不能为空");
                return result;
            }
            if (password == null || password.trim().isEmpty()) {
                result.put("code", 400);
                result.put("message", "密码不能为空");
                return result;
            }

            // 根据用户名查询用户
            VueUser user = vueUserMapper.selectByUsername(username);
            if (user == null) {
                result.put("code", 401);
                result.put("message", "用户名或密码错误");
                return result;
            }

            // 验证密码
            if (!passwordEncoder.matches(password, user.getPassword())) {
                result.put("code", 401);
                result.put("message", "用户名或密码错误");
                return result;
            }

            logger.info("商家用户登录成功，username={}", username);

            result.put("code", 200);
            result.put("message", "登录成功");
            Map<String, Object> data = new HashMap<>();
            data.put("username", user.getUsername());
            data.put("userId", user.getId());
            result.put("data", data);

        } catch (Exception e) {
            logger.error("商家用户登录失败：", e);
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
        }
        return result;
    }
}
