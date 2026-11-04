package com.example.cantingjiekou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.cantingjiekou.entity.Order;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

public interface OrderMapper extends BaseMapper<Order> {
    // 根据openid查询用户所有订单
    @Select("SELECT * FROM order_main WHERE user_id = #{openid} ORDER BY create_time DESC")
    List<Order> selectByOpenid(String openid);

    // 统计月度营业额：只统计已支付(1)和已完成(2)的订单，按支付时间分组
    @Select("SELECT " +
            "  DATE_FORMAT(pay_time, '%Y-%m') as month, " +
            "  SUM(total_amount) as revenue " +
            "FROM order_main " +
            "WHERE pay_status IN (1, 2) " +
            "GROUP BY DATE_FORMAT(pay_time, '%Y-%m') " +
            "ORDER BY month")
    List<Map<String, Object>> selectMonthlyRevenue();

    // Dashboard 统计：今日订单数、今日销售额、累计订单数、累计销售额（仅统计已支付+已完成）
    @Select("SELECT " +
            "  COALESCE(SUM(CASE WHEN DATE(pay_time) = CURDATE() THEN 1 ELSE 0 END), 0) as todayOrders, " +
            "  COALESCE(SUM(CASE WHEN DATE(pay_time) = CURDATE() THEN total_amount ELSE 0 END), 0) as todaySales, " +
            "  COUNT(*) as totalOrders, " +
            "  COALESCE(SUM(total_amount), 0) as totalSales " +
            "FROM order_main " +
            "WHERE pay_status IN (1, 2)")
    Map<String, Object> selectDashboardStats();

    // 商家后台：带筛选条件的分页订单列表（排除待支付订单）
    @Select("<script>SELECT * FROM order_main WHERE pay_status != 0 " +
            "<if test='orderNo != null and orderNo != \"\"'> AND order_no LIKE CONCAT('%', #{orderNo}, '%') </if>" +
            "<if test='status != null'> AND pay_status = #{status} </if>" +
            "<if test='startDate != null and startDate != \"\"'> AND DATE(pay_time) &gt;= #{startDate} </if>" +
            "<if test='endDate != null and endDate != \"\"'> AND DATE(pay_time) &lt;= #{endDate} </if>" +
            "ORDER BY pay_time DESC LIMIT #{offset}, #{limit}</script>")
    List<Order> selectAdminOrderList(@Param("orderNo") String orderNo, @Param("status") Integer status,
                                     @Param("startDate") String startDate, @Param("endDate") String endDate,
                                     @Param("offset") int offset, @Param("limit") int limit);

    // 商家后台：符合条件的订单总数（排除待支付订单）
    @Select("<script>SELECT COUNT(*) FROM order_main WHERE pay_status != 0 " +
            "<if test='orderNo != null and orderNo != \"\"'> AND order_no LIKE CONCAT('%', #{orderNo}, '%') </if>" +
            "<if test='status != null'> AND pay_status = #{status} </if>" +
            "<if test='startDate != null and startDate != \"\"'> AND DATE(pay_time) &gt;= #{startDate} </if>" +
            "<if test='endDate != null and endDate != \"\"'> AND DATE(pay_time) &lt;= #{endDate} </if>" +
            "</script>")
    int countAdminOrders(@Param("orderNo") String orderNo, @Param("status") Integer status,
                         @Param("startDate") String startDate, @Param("endDate") String endDate);
}