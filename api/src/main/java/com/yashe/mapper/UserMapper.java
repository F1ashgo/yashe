package com.yashe.mapper;

import com.yashe.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByEmail(@Param("email") String email);
    User findById(@Param("id") Long id);
    int insert(User user);
    int updatePassword(@Param("id") Long id, @Param("password") String password);
}
