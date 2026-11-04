package com.example.cantingjiekou.controller;

import com.example.cantingjiekou.entity.Dish;
import com.example.cantingjiekou.service.DishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
public class DishController {
    @Autowired
    private DishService dishService;

    // 状态转换方法
    private Integer convertStatus(Object statusValue) {
        if (statusValue == null) {
            return 1; // 默认上架
        }
        
        if (statusValue instanceof Integer) {
            return (Integer) statusValue;
        }
        
        if (statusValue instanceof String) {
            String statusStr = (String) statusValue;
            
            // 处理业务标识字符串
            if ("on_sale".equalsIgnoreCase(statusStr)) {
                return 1;
            } else if ("off_shelf".equalsIgnoreCase(statusStr) || "off_sale".equalsIgnoreCase(statusStr)) {
                return 0;
            }
            
            // 处理数字字符串
            try {
                return Integer.parseInt(statusStr);
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "状态参数无效: " + statusStr);
            }
        }
        
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "状态参数类型不支持");
    }

    @GetMapping("")
    public List<Dish> getAllDishes() {
        return dishService.getAllDishes();
    }

    @PostMapping("")
    public Map<String, Object> createDish(@RequestBody Dish dish) {
        // 转换状态值
        dish.setStatus(convertStatus(dish.getStatus()));
        
        boolean success = dishService.createDish(dish);
        if (success) {
            return Map.of("success", true, "message", "菜品创建成功");
        } else {
            return Map.of("success", false, "message", "菜品创建失败");
        }
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteDish(@PathVariable Long id) {
        boolean success = dishService.deleteDish(id);
        if (success) {
            return Map.of("success", true, "message", "菜品删除成功");
        } else {
            return Map.of("success", false, "message", "菜品删除失败");
        }
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateDish(@PathVariable Long id, @RequestBody Dish dish) {
        dish.setId(id);
        // 转换状态值
        dish.setStatus(convertStatus(dish.getStatus()));
        
        boolean success = dishService.updateDish(dish);
        if (success) {
            return Map.of("success", true, "message", "菜品更新成功");
        } else {
            return Map.of("success", false, "message", "菜品更新失败");
        }
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateDishStatus(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Object statusValue = request.get("status");
        Integer status = convertStatus(statusValue);
        
        boolean success = dishService.updateDishStatus(id, status);
        if (success) {
            return Map.of("success", true, "message", "状态更新成功");
        } else {
            return Map.of("success", false, "message", "状态更新失败");
        }
    }
}
