package com.example.cantingjiekou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.cantingjiekou.entity.OrderItem;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

public interface OrderItemMapper extends BaseMapper<OrderItem> {
    // 根据订单ID查询订单项（优先用order_detail冗余字段，菜品被删也不丢数据）
    @Select("SELECT " +
            "od.dish_id AS goodsId, " +
            "od.dish_quantity AS quantity, " +
            "od.dish_name AS goodsName, " +
            "od.dish_price AS goodsPrice, " +
            "COALESCE(d.image_url, '') AS imageUrl " +
            "FROM order_detail od " +
            "LEFT JOIN dishes d ON od.dish_id = d.dish_id " +
            "WHERE od.order_id = #{orderId}")
    List<OrderItem> selectByOrderId(Long orderId);

    // 批量查询多个订单的商品明细
    @Select("<script>SELECT " +
            "od.order_id AS orderId, " +
            "od.dish_id AS goodsId, " +
            "od.dish_quantity AS quantity, " +
            "od.dish_name AS goodsName, " +
            "od.dish_price AS goodsPrice, " +
            "COALESCE(d.image_url, '') AS imageUrl " +
            "FROM order_detail od " +
            "LEFT JOIN dishes d ON od.dish_id = d.dish_id " +
            "WHERE od.order_id IN " +
            "<foreach item='id' collection='orderIds' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach></script>")
    List<OrderItem> selectByOrderIds(@Param("orderIds") List<Long> orderIds);

    // 统计菜品销量
    @Select("SELECT dish_name as name, SUM(dish_quantity) as sales " +
            "FROM order_detail " +
            "GROUP BY dish_name " +
            "ORDER BY sales DESC")
    List<Map<String, Object>> selectProductSales();
}