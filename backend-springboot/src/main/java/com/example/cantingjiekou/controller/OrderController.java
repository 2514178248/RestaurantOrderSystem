package com.example.cantingjiekou.controller;

import com.example.cantingjiekou.entity.Order;
import com.example.cantingjiekou.entity.OrderItem;
import com.example.cantingjiekou.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 订单控制器
 * 修复：空指针校验、新增状态更新接口、精准异常处理、统一返回格式
 */
@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 提交订单
     * @param params 包含goodsList、tableNum（可选）
     * @return 订单ID + 订单编号
     */
    @PostMapping("/submit")
    public Map<String, Object> submitOrder(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        // 统一返回data字段，避免前端解析报错
        result.put("data", new HashMap<>());

        try {
            // 1. 精准参数校验
            if (params == null) {
                result.put("code", 400);
                result.put("msg", "请求参数不能为空");
                return result;
            }

            // openid现在是可选的，不作为必需参数
            String openid = params.get("openid") == null ? "" : params.get("openid").toString();
            List<Map<String, Object>> goodsList = (List<Map<String, Object>>) params.get("goodsList");
            String tableNum = params.get("tableNum") == null ? "默认桌号" : params.get("tableNum").toString();

            if (goodsList == null || goodsList.isEmpty()) {
                result.put("code", 400);
                result.put("msg", "商品列表不能为空");
                return result;
            }

            // 2. 调用服务层提交订单（openid为空时自动生成）
            Long orderId = orderService.submitOrder(openid, goodsList, tableNum);

            // 3. 安全获取订单编号（空值校验）
            Order order = orderService.getById(orderId);
            String orderNo = order != null ? order.getOrderNo() : "";

            // 4. 统一返回格式
            result.put("code", 200);
            result.put("msg", "订单提交成功");
            ((Map<String, Object>) result.get("data")).put("orderId", orderId);
            ((Map<String, Object>) result.get("data")).put("orderNo", orderNo);

        } catch (NumberFormatException e) {
            // 精准捕获数字转换异常
            result.put("code", 400);
            result.put("msg", "参数格式错误：商品ID/价格/数量必须为数字");
            e.printStackTrace();
        } catch (Exception e) {
            // 通用异常捕获
            result.put("code", 500);
            result.put("msg", "订单提交失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 查询订单列表
     * - 有 openid：C端查自己的订单
     * - 无 openid：商家后台查所有订单（支持分页+筛选）
     */
    @GetMapping("/list")
    public Map<String, Object> getOrderList(
            @RequestParam(required = false) String openid,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>());

        try {
            // 商家后台模式：无 openid
            if (openid == null || openid.isEmpty()) {
                Map<String, Object> adminResult = orderService.getAdminOrderList(
                    page, pageSize, orderNo, status, startDate, endDate);
                result.put("code", 200);
                result.put("msg", "查询成功");
                result.put("data", adminResult);
                return result;
            }

            // C端模式：有 openid
            List<Order> orderList = orderService.getOrderListByOpenid(openid);
            result.put("code", 200);
            result.put("msg", "查询成功");
            ((Map<String, Object>) result.get("data")).put("orderList", orderList);

        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询订单失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 根据订单ID查询订单项
     * @param orderId 订单ID
     * @return 订单项列表
     */
    @GetMapping("/items")
    public Map<String, Object> getOrderItems(@RequestParam Long orderId) {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>()); // 兜底data字段

        try {
            // 参数校验
            if (orderId == null || orderId <= 0) {
                result.put("code", 400);
                result.put("msg", "订单ID必须为正整数");
                return result;
            }

            List<OrderItem> itemList = orderService.getOrderItemsByOrderId(orderId);
            result.put("code", 200);
            result.put("msg", "查询成功");
            ((Map<String, Object>) result.get("data")).put("itemList", itemList);

        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询订单项失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 新增：更新订单状态（支付/取消订单）
     * @param params 包含orderId、payStatus
     * @return 操作结果
     */
    @PostMapping("/updateStatus")
    public Map<String, Object> updateOrderStatus(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>()); // 兜底data字段

        try {
            // 参数校验
            if (params == null) {
                result.put("code", 400);
                result.put("msg", "请求参数不能为空");
                return result;
            }

            // 安全转换参数（避免空指针）
            Long orderId = params.get("orderId") == null ? 0 : Long.parseLong(params.get("orderId").toString());
            Integer payStatus = params.get("payStatus") == null ? -1 : Integer.parseInt(params.get("payStatus").toString());

            if (orderId <= 0) {
                result.put("code", 400);
                result.put("msg", "订单ID必须为正整数");
                return result;
            }

            if (payStatus < 0 || payStatus > 3) {
                result.put("code", 400);
                result.put("msg", "支付状态只能是0(待支付)/1(已支付)/2(已完成)/3(已取消)");
                return result;
            }

            // 查询订单是否存在
            Order order = orderService.getById(orderId);
            if (order == null) {
                result.put("code", 404);
                result.put("msg", "订单不存在");
                return result;
            }

            // 更新状态
            order.setPayStatus(payStatus);
            boolean updateSuccess = orderService.updateById(order);

            if (updateSuccess) {
                result.put("code", 200);
                result.put("msg", "订单状态更新成功");
            } else {
                result.put("code", 500);
                result.put("msg", "订单状态更新失败");
            }

        } catch (NumberFormatException e) {
            result.put("code", 400);
            result.put("msg", "参数格式错误：orderId/payStatus必须为数字");
            e.printStackTrace();
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "更新订单状态失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 新增：根据订单ID查询单个订单详情
     * @param orderId 订单ID
     * @return 订单详情
     */
    @GetMapping("/detail")
    public Map<String, Object> getOrderDetail(@RequestParam Long orderId) {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>());

        try {
            if (orderId == null || orderId <= 0) {
                result.put("code", 400);
                result.put("msg", "订单ID必须为正整数");
                return result;
            }

            Order order = orderService.getById(orderId);
            if (order == null) {
                result.put("code", 404);
                result.put("msg", "订单不存在");
                return result;
            }

            result.put("code", 200);
            result.put("msg", "查询成功");
            ((Map<String, Object>) result.get("data")).put("order", order);

        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询订单详情失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 获取菜品销量统计
     */
    @GetMapping("/productSales")
    public Map<String, Object> getProductSales() {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>());

        try {
            List<Map<String, Object>> productSales = orderService.getProductSales();
            result.put("code", 200);
            result.put("msg", "查询成功");
            ((Map<String, Object>) result.get("data")).put("productSales", productSales);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询菜品销量失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 获取月度营业额统计
     */
    @GetMapping("/monthlyRevenue")
    public Map<String, Object> getMonthlyRevenue() {
        Map<String, Object> result = new HashMap<>();
        result.put("data", new HashMap<>());

        try {
            List<Map<String, Object>> monthlyRevenue = orderService.getMonthlyRevenue();
            result.put("code", 200);
            result.put("msg", "查询成功");
            ((Map<String, Object>) result.get("data")).put("monthlyRevenue", monthlyRevenue);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询月度营业额失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 商家后台：更新订单状态（接单/完成/取消）
     * PUT /api/order/{id}/status   body: { "status": "processing" }
     */
    @PutMapping("/{id}/status")
    public Map<String, Object> updateOrderStatusByString(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (id == null || id <= 0) {
                result.put("code", 400);
                result.put("msg", "订单ID无效");
                return result;
            }
            String status = params != null && params.get("status") != null
                ? params.get("status").toString() : null;
            if (status == null) {
                result.put("code", 400);
                result.put("msg", "状态参数不能为空");
                return result;
            }

            boolean ok = orderService.updateOrderStatusByString(id, status);
            if (ok) {
                result.put("code", 200);
                result.put("msg", "状态更新成功");
                result.put("success", true);
            } else {
                result.put("code", 400);
                result.put("msg", "状态更新失败：订单不存在或状态值无效");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "更新订单状态失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 获取 Dashboard 统计数据（今日订单数、今日销售额、累计订单数、累计销售额）
     */
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> stats = orderService.getDashboardStats();
            result.put("code", 200);
            result.put("msg", "查询成功");
            result.put("data", stats);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "查询 Dashboard 统计失败：" + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }
}