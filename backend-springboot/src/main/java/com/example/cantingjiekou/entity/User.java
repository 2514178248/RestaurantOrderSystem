package com.example.cantingjiekou.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户信息表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("user")
public class User {
    /**
     * 用户自增ID
     */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /**
     * 手机号
     */
    @TableField("`tel-number`")
    private String telNumber;

    /**
     * 微信小程序用户唯一标识
     */
    @TableField("openid")
    private String openid;

    /**
     * 用户自定义昵称
     */
    @TableField("nickname")
    private String nickname;

    /**
     * 用户头像（Base64格式）
     */
    @TableField("avatar")
    private String avatar;

    /**
     * 注册时间
     */
    @TableField("createTime")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("updateTime")
    private LocalDateTime updateTime;
}
