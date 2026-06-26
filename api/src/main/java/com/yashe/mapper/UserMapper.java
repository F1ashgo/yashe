package com.yashe.mapper;

import com.yashe.entity.User;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByEmail(@Param("email") String email);
    User findById(@Param("id") Long id);
    int insert(User user);
    int updatePassword(@Param("id") Long id, @Param("password") String password);

    // 管理员
    List<User> findAll(@Param("offset") int offset, @Param("limit") int limit);
    int countAll();
    int countToday();
    List<User> searchByEmail(@Param("keyword") String keyword, @Param("offset") int offset, @Param("limit") int limit);
    int countSearch(@Param("keyword") String keyword);
}
