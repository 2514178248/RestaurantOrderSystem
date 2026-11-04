package com.example.cantingjiekou.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.cantingjiekou.entity.Order;
import com.example.cantingjiekou.entity.OrderItem;
import java.util.List;
import java.util.Map;

public interface OrderService extends IService<Order> {
    // 生成唯一订单编号
    String generateOrderNo();

    // 提交订单（主表+明细表）
    Long submitOrder(String openid, List<Map<String, Object>> goodsList, String tableNum);

    // 根据openid查询订单列表
    List<Order> getOrderListByOpenid(String openid);

    // 根据订单ID查询订单项
    List<OrderItem> getOrderItemsByOrderId(Long orderId);

    // 获取菜品销量统计
    List<Map<String, Object>> getProductSales();

    // 获取月度营业额统计
    List<Map<String, Object>> getMonthlyRevenue();

    // 获取 Dashboard 统计数据
    Map<String, Object> getDashboardStats();

    // 商家后台：分页查询所有订单（支持筛选）
    Map<String, Object> getAdminOrderList(int page, int pageSize, String orderNo, String status,
                                          String startDate, String endDate);

    // 商家后台：根据字符串状态更新订单（pending/processing/completed/cancelled）
    boolean updateOrderStatusByString(Long orderId, String statusStr);
}