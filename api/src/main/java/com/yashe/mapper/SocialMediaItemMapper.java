package com.yashe.mapper;

import com.yashe.entity.SocialMediaItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SocialMediaItemMapper {
    int insert(SocialMediaItem item);
    int update(SocialMediaItem item);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
    int deleteById(@Param("id") Long id);
    SocialMediaItem findById(@Param("id") Long id);
    Integer findMaxSortOrder(@Param("platform") String platform);
    int countByImage(@Param("image") String image);
    List<SocialMediaItem> findAll();
    List<SocialMediaItem> findByPlatformPublished(@Param("platform") String platform);
}
