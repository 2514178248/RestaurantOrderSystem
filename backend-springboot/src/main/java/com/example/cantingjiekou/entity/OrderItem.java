package com.example.cantingjiekou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@TableName("order_detail") // 数据库表名：order_detail（保持不变）
public class OrderItem {
    @TableId(type = IdType.AUTO)
    private Long id;                // 对应数据库字段：id

    @TableField("order_id")
    private Long orderId;           // 映射到数据库列：order_id

    @TableField("dish_id")
    private Long goodsId;           // 映射到数据库列：dish_id（原goods_id）

    @TableField("dish_name")
    private String goodsName;       // 映射到数据库列：dish_name（原goods_name）

    @TableField("dish_price")
    private BigDecimal goodsPrice;  // 映射到数据库列：dish_price（原goods_price）

    @TableField("dish_quantity")
    private Integer quantity;       // 映射到数据库列：dish_quantity（原quantity）

    private String imageUrl;
}