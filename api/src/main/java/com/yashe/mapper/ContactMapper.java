package com.yashe.mapper;

import com.yashe.entity.ContactMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContactMapper {
    int insert(ContactMessage msg);
}
