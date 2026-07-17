package com.yashe.mapper;

import com.yashe.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    int insert(Notification notification);
    int update(Notification notification);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    int deleteById(@Param("id") Long id);
    List<Notification> findAll();
    List<Notification> findPublished(@Param("limit") int limit);
}
