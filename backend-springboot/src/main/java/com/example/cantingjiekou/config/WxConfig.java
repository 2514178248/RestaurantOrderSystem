package com.example.cantingjiekou.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 微信小程序配置类
 * 读取application.properties中以wx为前缀的配置
 */
@Component  // 关键：添加@Component，确保Spring能扫描并实例化
@Configuration
@ConfigurationProperties(prefix = "wx")
public class WxConfig {
    private static final Logger logger = LoggerFactory.getLogger(WxConfig.class);

    // 配置文件中wx.app-id → 自动映射到appId（Spring Boot支持中划线转驼峰）
    private String appId;
    // 配置文件中wx.app-secret → 自动映射到appSecret
    private String appSecret;

    // 初始化后校验配置是否加载成功
    @PostConstruct
    public void checkConfig() {
        if (appId == null || appId.trim().isEmpty()) {
            logger.error("WxConfig初始化失败：appId未配置！请检查application.properties中的wx.app-id");
        } else {
            logger.info("WxConfig初始化成功：appId={}", appId);
        }
        if (appSecret == null || appSecret.trim().isEmpty()) {
            logger.error("WxConfig初始化失败：appSecret未配置！请检查application.properties中的wx.app-secret");
        }
    }

    // getter/setter方法
    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAppSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }
}