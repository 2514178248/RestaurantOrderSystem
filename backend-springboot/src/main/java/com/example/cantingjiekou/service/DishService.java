package com.example.cantingjiekou.service;

import com.example.cantingjiekou.entity.Dish;
import com.example.cantingjiekou.mapper.DishMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DishService {
    @Autowired
    private DishMapper dishMapper;

    public List<Dish> getAllDishes() {
        return dishMapper.selectList(null);
    }

    public boolean createDish(Dish dish) {
        int result = dishMapper.insert(dish);
        return result > 0;
    }

    public boolean deleteDish(Long id) {
        int result = dishMapper.deleteById(id);
        return result > 0;
    }

    public boolean updateDish(Dish dish) {
        int result = dishMapper.updateById(dish);
        return result > 0;
    }

    public boolean updateDishStatus(Long id, Integer status) {
        Dish dish = dishMapper.selectById(id);
        if (dish == null) {
            return false;
        }
        dish.setStatus(status);
        int result = dishMapper.updateById(dish);
        return result > 0;
    }
}
