package com.example.cantingjiekou.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 订单 WebSocket 处理器：维护所有已连接客户端，订单状态变更时广播推送
 */
@Component
public class OrderWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(OrderWebSocketHandler.class);

    /** 客户端连接池（CopyOnWriteArraySet 保证并发安全） */
    private static final Set<WebSocketSession> SESSIONS = new CopyOnWriteArraySet<>();

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        SESSIONS.add(session);
        logger.info("【WebSocket】客户端已连接，当前在线数：{}", SESSIONS.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        SESSIONS.remove(session);
        logger.info("【WebSocket】客户端断开，当前在线数：{}", SESSIONS.size());
    }

    /**
     * 向所有在线客户端广播消息
     * @param type 消息类型（new_order / status_change）
     * @param payload 消息内容
     */
    public static void broadcast(String type, Map<String, Object> payload) {
        if (SESSIONS.isEmpty()) {
            return;
        }
        Map<String, Object> message = new HashMap<>(payload);
        message.put("type", type);
        String json;
        try {
            json = MAPPER.writeValueAsString(message);
        } catch (Exception e) {
            logger.error("【WebSocket】消息序列化失败", e);
            return;
        }
        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : SESSIONS) {
            try {
                if (session.isOpen()) {
                    synchronized (session) {
                        session.sendMessage(textMessage);
                    }
                }
            } catch (Exception e) {
                logger.warn("【WebSocket】推送失败，移除会话：{}", session.getId());
                SESSIONS.remove(session);
            }
        }
        logger.info("【WebSocket】已推送 type={}，当前在线数：{}", type, SESSIONS.size());
    }
}
