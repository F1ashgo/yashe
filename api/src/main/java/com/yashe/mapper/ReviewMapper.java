package com.yashe.mapper;

import com.yashe.entity.Review;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReviewMapper {
    int insert(Review review);
    List<Review> findByUserId(@Param("userId") Long userId);
}
