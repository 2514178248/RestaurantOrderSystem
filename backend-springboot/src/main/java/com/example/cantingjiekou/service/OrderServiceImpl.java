package com.example.cantingjiekou.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.cantingjiekou.entity.Order;
import com.example.cantingjiekou.entity.OrderItem;
import com.example.cantingjiekou.entity.User;
import com.example.cantingjiekou.mapper.OrderItemMapper;
import com.example.cantingjiekou.mapper.OrderMapper;
import com.example.cantingjiekou.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    // 注入订单项Mapper（必须加，否则无法操作订单项表）
    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private UserMapper userMapper;

    // 生成订单编号（可选，若订单主表需要则保留）
    @Override
    public String generateOrderNo() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = LocalDateTime.now().format(formatter);
        Random random = new Random();
        int randomNum = 100000 + random.nextInt(900000);
        return dateStr + randomNum;
    }

    // 提交订单（包含订单主表+订单项明细表插入）
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long submitOrder(String openid, List<Map<String, Object>> goodsList, String tableNum) {
        // 1. 计算订单总价和总数
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Map<String, Object> goods : goodsList) {
            BigDecimal price = new BigDecimal(goods.get("price").toString());
            int quantity = Integer.parseInt(goods.get("quantity").toString());
            totalPrice = totalPrice.add(price.multiply(new BigDecimal(quantity)));
        }

        // 2. 生成唯一订单编号（保留原有生成逻辑）
        String orderNo = generateOrderNo();

        // 3. 如果openid为空，生成临时用户ID（基于时间戳+随机数）
        if (openid == null || openid.trim().isEmpty()) {
            openid = "TEMP_" + System.currentTimeMillis() + "_" + new Random().nextInt(10000);
        }

        // 4. 插入订单主表（匹配你的 Order 实体类）
        Order order = new Order();
        order.setOrderNo(orderNo); // 👉 设置订单编号
        order.setUserId(openid); // 设置用户ID（可能是临时ID）
        order.setTotalAmount(totalPrice); // 假设 total_amount 已改为 BigDecimal
        order.setPayStatus(0); // 0-待支付
        order.setTableNum(tableNum); // 桌号，可根据前端传参调整z
        orderMapper.insert(order);
        Long orderId = order.getOrderId(); // 获取自增订单ID

        // 5. 插入订单项明细表（修正后）
        for (Map<String, Object> goods : goodsList) {
            OrderItem item = new OrderItem();
            item.setOrderId(orderId); // ✅ 正常解析：对应实体类 orderId 字段
            item.setGoodsId(Long.parseLong(goods.get("id").toString())); // ✅ goodsId
            item.setGoodsName(goods.get("name").toString()); // ✅ goodsName
            item.setGoodsPrice(new BigDecimal(goods.get("price").toString())); // ✅ goodsPrice
            item.setQuantity(Integer.parseInt(goods.get("quantity").toString())); // ✅ quantity
            orderItemMapper.insert(item);
        }

        return orderId;
    }

    // 可选：根据订单ID查询订单项（用于前端订单详情页）
    @Override
    public List<OrderItem> getOrderItemsByOrderId(Long orderId) {
        return orderItemMapper.selectByOrderId(orderId);
    }

    // 查询订单列表（含商品明细）
    @Override
    public List<Order> getOrderListByOpenid(String openid) {
        List<Order> orders = orderMapper.selectList(
            Wrappers.<Order>lambdaQuery().eq(Order::getUserId, openid)
        );

        if (!orders.isEmpty()) {
            List<Long> orderIds = orders.stream()
                .map(Order::getOrderId)
                .collect(Collectors.toList());
            List<OrderItem> allItems = orderItemMapper.selectByOrderIds(orderIds);
            Map<Long, List<OrderItem>> itemMap = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));

            for (Order order : orders) {
                order.setGoods(itemMap.getOrDefault(order.getOrderId(), new ArrayList<>()));
            }
        }

        return orders;
    }

    @Override
    public List<Map<String, Object>> getProductSales() {
        // 统计菜品销量：按菜品名称分组，统计总销量
        return orderItemMapper.selectProductSales();
    }

    @Override
    public List<Map<String, Object>> getMonthlyRevenue() {
        return orderMapper.selectMonthlyRevenue();
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        return orderMapper.selectDashboardStats();
    }

    // ---------- 状态映射工具 ----------

    private Integer statusToInt(String s) {
        if (s == null) return null;
        return switch (s) {
            case "pending" -> 0;
            case "processing" -> 1;
            case "completed" -> 2;
            case "cancelled" -> 3;
            default -> null;
        };
    }

    private String statusToString(Integer i) {
        if (i == null) return "pending";
        return switch (i) {
            case 0 -> "pending";
            case 1 -> "processing";
            case 2 -> "completed";
            case 3 -> "cancelled";
            default -> "pending";
        };
    }

    // ---------- 商家后台 ----------

    @Override
    public Map<String, Object> getAdminOrderList(int page, int pageSize, String orderNo, String statusStr,
                                                  String startDate, String endDate) {
        Integer payStatus = statusToInt(statusStr);
        int offset = (page - 1) * pageSize;

        List<Order> orders = orderMapper.selectAdminOrderList(orderNo, payStatus, startDate, endDate, offset, pageSize);
        int total = orderMapper.countAdminOrders(orderNo, payStatus, startDate, endDate);

        // 批量加载订单明细
        if (!orders.isEmpty()) {
            List<Long> orderIds = orders.stream().map(Order::getOrderId).collect(Collectors.toList());
            List<OrderItem> allItems = orderItemMapper.selectByOrderIds(orderIds);
            Map<Long, List<OrderItem>> itemMap = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
            for (Order order : orders) {
                order.setGoods(itemMap.getOrDefault(order.getOrderId(), new ArrayList<>()));
            }
        }

        // 批量查用户手机号：收集所有有效 openid → 查 user 表 → openid→手机号 映射
        List<String> openidList = orders.stream()
                .map(Order::getUserId)
                .filter(id -> id != null && !id.trim().isEmpty() && !id.startsWith("TEMP_"))
                .distinct()
                .collect(Collectors.toList());
        Map<String, String> openidToPhone = new HashMap<>();
        if (!openidList.isEmpty()) {
            List<User> users = userMapper.selectList(
                Wrappers.<User>lambdaQuery().in(User::getOpenid, openidList)
            );
            for (User u : users) {
                openidToPhone.put(u.getOpenid(), u.getTelNumber() != null ? u.getTelNumber() : "");
            }
        }

        // 转换为前端格式
        List<Map<String, Object>> records = orders.stream().map(order -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", order.getOrderId());
            map.put("orderNo", order.getOrderNo());
            String userId = order.getUserId();
            // 用户昵称 → 显示手机号（查不到则显示"匿名用户"或openid截断）
            String customerName = "匿名用户";
            if (userId != null && !userId.trim().isEmpty()) {
                if (userId.startsWith("TEMP_")) {
                    customerName = "匿名用户";
                } else {
                    String phone = openidToPhone.get(userId);
                    customerName = (phone != null && !phone.isEmpty()) ? phone : userId.substring(0, Math.min(8, userId.length())) + "...";
                }
            }
            map.put("customerName", customerName);
            map.put("openid", order.getUserId());
            map.put("orderTime", order.getPayTime() != null ? order.getPayTime().toString() : "");
            map.put("info", order.getTableNum() != null ? order.getTableNum() : "");
            map.put("amount", order.getTotalAmount());
            map.put("status", statusToString(order.getPayStatus()));

            List<OrderItem> goods = order.getGoods();
            List<Map<String, Object>> items = (goods != null ? goods : new ArrayList<OrderItem>()).stream().map(item -> {
                Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("name", item.getGoodsName());
                itemMap.put("price", item.getGoodsPrice());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("image", item.getImageUrl() != null ? item.getImageUrl() : "");
                return itemMap;
            }).collect(Collectors.toList());
            map.put("items", items);

            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", total);
        return result;
    }

    @Override
    public boolean updateOrderStatusByString(Long orderId, String statusStr) {
        Integer payStatus = statusToInt(statusStr);
        if (payStatus == null) {
            return false;
        }
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            return false;
        }
        order.setPayStatus(payStatus);
        return orderMapper.updateById(order) > 0;
    }
}