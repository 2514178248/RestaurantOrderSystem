package com.example.cantingjiekou.controller;

import com.example.cantingjiekou.entity.User;
import com.example.cantingjiekou.mapper.UserMapper;
import com.example.cantingjiekou.utils.WxUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 * 处理用户登录、注册等相关业务
 */
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private WxUtil wxUtil;
    
    /**
     * 获取微信openid
     */
    @PostMapping("/openid")
    public Map<String, Object> getOpenid(@RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        result.put("data", data);

        try {
            String code = params.get("code");
            if (code == null || code.trim().isEmpty()) {
                result.put("code", 400);
                result.put("msg", "code不能为空");
                return result;
            }

            String openid = wxUtil.getOpenId(code);
            if (openid == null || openid.trim().isEmpty()) {
                result.put("code", 500);
                result.put("msg", "从微信获取openid失败");
                return result;
            }

            data.put("openid", openid);
            result.put("code", 200);
            result.put("msg", "获取openid成功");
        } catch (Exception e) {
            logger.error("【openid接口】发生异常：", e);
            result.put("code", 500);
            result.put("msg", "获取openid失败：" + e.getMessage());
        }

        return result;
    }

    /**
     * 用户登录接口
     * 前端传入手机号和openid，后端自动登录或注册
     */
    @PostMapping("/login")
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> login(@RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();

        try {
            String telNumber = params.get("telNumber");
            String openid = params.get("openid");

            if (telNumber == null || !telNumber.matches("\\d{11}")) {
                result.put("code", 400);
                result.put("msg", "请输入11位手机号");
                result.put("data", null);
                return result;
            }

            if (openid == null || openid.trim().isEmpty()) {
                result.put("code", 400);
                result.put("msg", "openid不能为空");
                result.put("data", null);
                return result;
            }

            User existUser = userMapper.selectByTelNumber(telNumber);
            if (existUser != null) {
                logger.info("【登录接口】老用户登录，telNumber={}", telNumber);
                result.put("code", 200);
                result.put("msg", "登录成功");
                result.put("data", existUser);
                return result;
            }

            LocalDateTime now = LocalDateTime.now();
            User newUser = User.builder()
                    .telNumber(telNumber)
                    .openid(openid)
                    .nickname(telNumber)
                    .avatar("")
                    .createTime(now)
                    .updateTime(now)
                    .build();

            userMapper.insert(newUser);
            logger.info("【登录接口】新用户创建成功，telNumber={}, userId={}", telNumber, newUser.getId());

            result.put("code", 200);
            result.put("msg", "登录成功");
            result.put("data", newUser);
        } catch (Exception e) {
            logger.error("【登录接口】发生异常：", e);
            result.put("code", 500);
            result.put("msg", "登录失败：" + e.getMessage());
            result.put("data", null);
        }

        return result;
    }
}
