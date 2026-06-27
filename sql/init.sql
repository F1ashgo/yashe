-- ==========================================
-- 雅舍 Atelier des Miyabi 数据库初始化
-- ==========================================

CREATE DATABASE IF NOT EXISTS yashe_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE yashe_db;

-- ==========================================
-- 用户表
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL COMMENT '姓名',
  email       VARCHAR(100) NOT NULL COMMENT '邮箱（登录账号）',
  phone       VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
  password    VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
  promo_code  VARCHAR(50)  DEFAULT NULL COMMENT '优惠码',
  role        VARCHAR(20)  DEFAULT 'member' COMMENT '角色：member / admin',
  status      TINYINT      DEFAULT 1 COMMENT '状态：1=正常 0=禁用',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB COMMENT='用户表';

-- ==========================================
-- 优惠码表
-- ==========================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(50)  NOT NULL COMMENT '优惠码',
  discount    DECIMAL(5,2) NOT NULL COMMENT '折扣比例（如0.9=9折）',
  amount      DECIMAL(10,2) DEFAULT NULL COMMENT '抵扣金额（如2000.00=抵扣2000元）',
  max_uses    INT          DEFAULT 100 COMMENT '最大使用次数',
  used_count  INT          DEFAULT 0 COMMENT '已使用次数',
  valid_from  DATE         DEFAULT NULL COMMENT '生效日期',
  valid_until DATE         DEFAULT NULL COMMENT '失效日期',
  status      TINYINT      DEFAULT 1 COMMENT '1=有效 0=无效',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB COMMENT='优惠码表';


-- ==========================================
-- 用户优惠码关联表
-- ==========================================
CREATE TABLE IF NOT EXISTS user_promos (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  promo_id    BIGINT NOT NULL,
  used_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (promo_id) REFERENCES promo_codes(id)
) ENGINE=InnoDB COMMENT='用户优惠码使用记录';


-- ==========================================
-- 联络表单
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL COMMENT '姓名',
  email       VARCHAR(100) NOT NULL COMMENT '邮箱',
  phone       VARCHAR(20)  DEFAULT NULL COMMENT '电话',
  subject     VARCHAR(100) DEFAULT NULL COMMENT '主题',
  message     TEXT         NOT NULL COMMENT '留言内容',
  is_read     TINYINT      DEFAULT 0 COMMENT '0=未读 1=已读',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='联络表单留言';



-- ==========================================
-- 示例数据
-- ==========================================
INSERT IGNORE INTO promo_codes (code, discount, amount, max_uses) VALUES
('YASHE2024', 0.90, NULL, 200),
('WELCOME2000', NULL, 2000.00, 500),
('VIP888', 0.85, NULL, 100);
