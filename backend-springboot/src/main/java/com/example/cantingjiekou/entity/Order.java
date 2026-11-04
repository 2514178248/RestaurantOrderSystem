package com.example.cantingjiekou.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("order_main")
public class Order {

    // 订单ID 主键自增
    @TableId(type = IdType.AUTO)
    private Long orderId;

    // 订单编号
    private String orderNo;

    // 用户openid（数据库：user_id，字符串类型）
    private String userId;

    // 总价（decimal 对应 BigDecimal）
    private BigDecimal totalAmount;

    // 支付状态 0-待支付 1-已支付 2-已完成 3-已取消
    private Integer payStatus;

    // 桌号
    private String tableNum;

    // 创建时间
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime payTime;

    // 更新时间
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    // 订单商品明细（非数据库字段，仅用于返回给前端）
    @TableField(exist = false)
    private List<OrderItem> goods;
}