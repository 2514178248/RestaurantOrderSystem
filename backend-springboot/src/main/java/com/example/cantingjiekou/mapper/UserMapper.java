package com.example.cantingjiekou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.cantingjiekou.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 用户数据访问层
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    /**
     * 根据openid查询用户
     */
    @Select("SELECT id, `tel-number` AS telNumber, openid, nickname, avatar, createTime, updateTime FROM user WHERE openid = #{openid} LIMIT 1")
    User selectByOpenid(@Param("openid") String openid);

    /**
     * 根据手机号查询用户
     */
    @Select("SELECT id, `tel-number` AS telNumber, openid, nickname, avatar, createTime, updateTime FROM user WHERE `tel-number` = #{telNumber} LIMIT 1")
    User selectByTelNumber(@Param("telNumber") String telNumber);
}
