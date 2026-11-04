package com.example.cantingjiekou.utils;

import com.alibaba.fastjson2.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.example.cantingjiekou.config.WxConfig;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Component
public class WxUtil {
    // 1. 添加日志对象，方便排查问题
    private static final Logger logger = LoggerFactory.getLogger(WxUtil.class);

    @Autowired
    private WxConfig wxConfig;

    public String getOpenId(String code) {
        // 2. 前置参数校验：避免空参数调用接口
        if (code == null || code.trim().isEmpty()) {
            logger.error("获取openid失败：前端传入的code为空");
            return null;
        }
        if (wxConfig == null) {
            logger.error("获取openid失败：WxConfig配置未加载");
            return null;
        }
        String appId = wxConfig.getAppId();
        String appSecret = wxConfig.getAppSecret();
        if (appId == null || appId.trim().isEmpty()) {
            logger.error("获取openid失败：appId配置为空");
            return null;
        }
        if (appSecret == null || appSecret.trim().isEmpty()) {
            logger.error("获取openid失败：appSecret配置为空");
            return null;
        }

        HttpURLConnection con = null;
        BufferedReader in = null;
        try {
            // 3. 拼接微信接口URL（打印URL方便调试）
            String urlStr = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appId
                    + "&secret=" + appSecret
                    + "&js_code=" + code
                    + "&grant_type=authorization_code";
            logger.info("调用微信code2session接口：{}", urlStr);

            URL obj = new URL(urlStr);
            con = (HttpURLConnection) obj.openConnection();

            // 4. 设置请求超时（避免网络阻塞）
            con.setRequestMethod("GET");
            con.setConnectTimeout(5000); // 连接超时5秒
            con.setReadTimeout(5000);    // 读取超时5秒

            // 5. 检查响应码（非200直接返回）
            int responseCode = con.getResponseCode();
            if (responseCode != 200) {
                logger.error("微信接口响应失败：响应码={}", responseCode);
                return null;
            }

            // 6. 读取响应（指定UTF-8编码，避免乱码）
            in = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            String responseStr = response.toString();
            logger.info("微信接口返回数据：{}", responseStr);

            // 7. 解析响应，检查错误码（核心！）
            JSONObject json = JSONObject.parseObject(responseStr);
            if (json.containsKey("errcode") && json.getIntValue("errcode") != 0) {
                int errCode = json.getIntValue("errcode");
                String errMsg = json.getString("errmsg");
                logger.error("微信接口返回错误：errcode={}, errmsg={}", errCode, errMsg);
                return null;
            }

            // 8. 获取openid并校验
            String openid = json.getString("openid");
            if (openid == null || openid.trim().isEmpty()) {
                logger.error("微信接口返回openid为空");
                return null;
            }
            logger.info("获取openid成功：{}", openid);
            return openid;

        } catch (Exception e) {
            // 9. 捕获所有异常并打印完整堆栈
            logger.error("调用微信接口获取openid时发生异常", e);
            return null;
        } finally {
            // 10. 确保资源关闭，避免泄漏
            try {
                if (in != null) {
                    in.close();
                }
                if (con != null) {
                    con.disconnect();
                }
            } catch (Exception e) {
                logger.warn("关闭资源时发生异常", e);
            }
        }
    }
}