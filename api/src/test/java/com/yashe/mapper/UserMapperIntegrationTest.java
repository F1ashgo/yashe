package com.yashe.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.yashe.entity.User;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

@MybatisTest
@TestPropertySource(properties = {
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-test.sql"
})
class UserMapperIntegrationTest {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void mapsTokenVersionByIdAndEmail() {
        jdbcTemplate.update("""
                INSERT INTO users (name, email, password, role, status, token_version)
                VALUES (?, ?, ?, ?, ?, ?)
                """, "安全测试用户", "security@example.test", "hash", "member", 1, 3);

        User byEmail = userMapper.findByEmail("security@example.test");
        User byId = userMapper.findById(byEmail.getId());

        assertThat(byEmail.getTokenVersion()).isEqualTo(3);
        assertThat(byId.getTokenVersion()).isEqualTo(3);
    }
}
