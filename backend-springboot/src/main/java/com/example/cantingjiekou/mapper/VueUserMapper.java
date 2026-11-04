package com.example.cantingjiekou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.cantingjiekou.entity.VueUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface VueUserMapper extends BaseMapper<VueUser> {

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM Vue_user WHERE username = #{username}")
    VueUser selectByUsername(@Param("username") String username);

    /**
     * 根据邮箱查询用户
     */
    @Select("SELECT * FROM Vue_user WHERE email = #{email}")
    VueUser selectByEmail(@Param("email") String email);

    /**
     * 根据手机号查询用户
     */
    @Select("SELECT * FROM Vue_user WHERE phone = #{phone}")
    VueUser selectByPhone(@Param("phone") String phone);
}
