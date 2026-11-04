package com.example.cantingjiekou.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;


import com.baomidou.mybatisplus.annotation.TableField;

@TableName("dishes")
public class Dish {
    @TableId(value = "dish_id",type = IdType.AUTO)
    private Long id;
    @TableField("dish_name")
    private String name;

    @TableField("dish_description")
    private String description;

    @TableField("dish_price")
    private Double price;

    @TableField("image_url")
    private String image;
    @TableField("category")
    private Integer categoryId;

    @TableField("status")
    private Integer status;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
