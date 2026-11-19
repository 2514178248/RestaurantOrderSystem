package com.example.cantingjiekou.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 局域网探针接口
 * 小程序端启动时会并发探测局域网内的候选 IP，
 * 只有本服务会返回带 service 标记的响应，用于确认"这个 IP 就是后端"。
 */
@RestController
@RequestMapping("/api/ping")
public class PingController {

    @GetMapping("")
    public Map<String, Object> ping() {
        return Map.of("code", 200, "msg", "pong", "service", "canyingdiandan");
    }
}
