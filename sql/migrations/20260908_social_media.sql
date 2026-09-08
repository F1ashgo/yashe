-- 社交媒体图库条目表 + 从 captions.json 迁移的种子数据（图片统一存于后端 uploads/）
SET NAMES utf8mb4;
USE yashe_db;

CREATE TABLE IF NOT EXISTS social_media_items (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  platform   VARCHAR(30)  NOT NULL COMMENT 'douyin / xiaohongshu / wechat-channel',
  image      VARCHAR(500) NOT NULL COMMENT '图片路径：/api/uploads/<platform>/<file> 或 /api/uploads/<uuid> 或完整URL',
  caption    VARCHAR(255) NOT NULL COMMENT '说明文字',
  url        VARCHAR(500) DEFAULT NULL COMMENT '原文链接',
  sort_order INT          DEFAULT 0 COMMENT '排序（升序）',
  status     TINYINT      DEFAULT 1 COMMENT '1=显示 0=隐藏',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_platform_status_sort (platform, status, sort_order)
) ENGINE=InnoDB COMMENT='社交媒体图库条目';

INSERT INTO social_media_items (platform, image, caption, url, sort_order, status) VALUES
('douyin', '/api/uploads/douyin/1.jpg', '多巴胺配色方案：点亮小户型空间！', 'https://v.douyin.com/wx4XrXybKFI/', 1, 1),
('douyin', '/api/uploads/douyin/2.jpg', '拒绝普通，带你沉浸式体验功能与颜值并存的梦中情房', 'https://v.douyin.com/Wem-nlvdHNU/', 2, 1),
('douyin', '/api/uploads/douyin/3.jpg', '把森林搬进家，这才是成年人最渴望的精神栖息地', 'https://v.douyin.com/GupaEoouDjw/', 3, 1),
('douyin', '/api/uploads/douyin/4.jpg', '人宠共居社交空间 ☕🐕 让家变成我们的慵懒小岛 🏡', 'https://v.douyin.com/yh8McDXyL_E/', 4, 1),
('douyin', '/api/uploads/douyin/5.jpg', '沉浸式第一视角感受温馨家装', 'https://v.douyin.com/SNQZrE5_0V0/', 5, 1),
('douyin', '/api/uploads/douyin/6.jpg', '秋天的第️1️杯奶茶不够喝？一键激活系统，自己开一家！', 'https://v.douyin.com/fWLPK3zuBfE/', 6, 1),
('douyin', '/api/uploads/douyin/7.jpg', '大白墙变身空中乐园！这种人猫共处空间也太暖了✨', 'https://v.douyin.com/twh1D0FWVCM/', 7, 1),
('douyin', '/api/uploads/douyin/8.jpg', '小卧室儿童房试试这套高架床！上床下桌空间开阔多啦✨', 'https://v.douyin.com/rAdNB-5usJo/', 8, 1),
('douyin', '/api/uploads/douyin/9.jpg', '双人儿童房改造模板！一房住两人也太温馨啦🏡', 'https://v.douyin.com/Pn_xgFpM5BI/', 9, 1),
('douyin', '/api/uploads/douyin/10.jpg', '空调选购避坑指南：窗机、挂机、多联机怎么选？💡🏠', 'https://v.douyin.com/ZjzvegwTPoE/', 10, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/1.jpg', '00后独居女孩的多巴胺奶油小家 📺', 'https://www.xiaohongshu.com/explore/6a506822000000001c025b06?xsec_token=ABZTS5fj3m5Wm8SdRmtv8CzZLfa3IzrND9b5EhjsgqKis=&xsec_source=pc_user', 1, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/2.jpg', '把新中式美学搬进家🎋', 'https://www.xiaohongshu.com/explore/6a571bb10000000016024afd?xsec_token=ABnEnPNXhDh6JyayTQK2X2qti--fBKCpCuI1klZZ6L2ek=&xsec_source=pc_user', 2, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/3.jpg', '新中式里的松弛感让人在家舒服到不想出门', 'https://www.xiaohongshu.com/explore/6a6058d1000000000100d080?xsec_token=ABR24CJMjyPgYgKw_vgPPc8kbWZ2WwoBvQqgi3bU8o4ZM=&xsec_source=pc_user', 3, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/5.jpg', '人宠共居 🐾 极简温暖风毛孩子之家', 'https://www.xiaohongshu.com/explore/6a69a23b000000001101e789?xsec_token=ABV-5FBpwc8Eq-zlAHz8U38jlNuDtmj-y7htbXDYl-Byw=&xsec_source=pc_user', 4, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/4.jpg', '高颜值撞色家！和猫咪的满分陪伴空间🌈', 'https://www.xiaohongshu.com/explore/6a73fffb00000000250076d3?xsec_token=ABSNYYMREK2pq7kLXiYMTA73lWucKDuwyfMrbG7P_E7es=&xsec_source=pc_user', 5, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/6.jpg', 'Loft装修——暖灰与森系的高级“呼吸感”', 'https://www.xiaohongshu.com/explore/6a7bf5b50000000025017add?xsec_token=ABVqd_K6LkBfBGI-krwNpsYDtrcxDoWmJqEigwM_NbOeM=&xsec_source=pc_user', 6, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/7.jpg', '奶油黄养宠LOFT开箱！', 'https://www.xiaohongshu.com/explore/6a865cf1000000002202353d?xsec_token=AB9ZUpLr7wdtcy5gKVll9-Ok_T6vPS84bN3O4HJQvyEBQ=&xsec_source=pc_user', 7, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/8.jpg', '不同的空间配色，推门就是不一样的感觉✨', 'https://www.xiaohongshu.com/discovery/item/6a8e5edd0000000020037a41?source=webshare&xhsshare=pc_web&xsec_token=ABcWhR7vjNCA6TY6Tzln7kYlhiRiGwKrNQI3Rfqr2bloI=&xsec_source=pc_share', 8, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/9.jpg', '双人儿童房设计可以一起玩的赛车房！', 'https://www.xiaohongshu.com/discovery/item/6a8f999b000000002a03d57a?source=webshare&xhsshare=pc_web&xsec_token=ABA-NpFCXLkstLm0pzoRHT-7Km3_N9YIenPo1TvEdWrhk=&xsec_source=pc_share', 9, 1),
('xiaohongshu', '/api/uploads/xiaohongshu/10.jpg', '阿尔托中古北欧风：去家务化的懒人友好家！', 'https://www.xiaohongshu.com/discovery/item/6a97be55000000002a026e4e?source=webshare&xhsshare=pc_web&xsec_token=AByDwgQ6vIPP1y86G5L7CHj46UcVRy3ym4widuzxK56Rs=&xsec_source=pc_share', 10, 1),
('wechat-channel', '/api/uploads/wechat-channel/1.jpg', '沉浸式深夜充电 💡 打造暖乎乎的多巴胺客厅 🛋️', 'https://weixin.qq.com/sph/AZbuNgaHz', 1, 1),
('wechat-channel', '/api/uploads/wechat-channel/2.jpg', '带你沉浸式体验从空房间到多功能餐厨空间的蜕变过程。', 'https://weixin.qq.com/sph/AIc6xGMbv', 2, 1),
('wechat-channel', '/api/uploads/wechat-channel/3.jpg', '每当城市被阴雨笼罩，我格外享受回到这个亲手布置的新中式角落', 'https://weixin.qq.com/sph/AuBKLfRz7', 3, 1),
('wechat-channel', '/api/uploads/wechat-channel/4.jpg', '玻璃阳光房茶室设计的软装细节真的太让人放松了！', 'https://weixin.qq.com/sph/AiVa6P63w', 4, 1),
('wechat-channel', '/api/uploads/wechat-channel/5.jpg', '带大家全局解锁这套客厅整体空间设计！', 'https://weixin.qq.com/sph/A5DwTnSMm', 5, 1),
('wechat-channel', '/api/uploads/wechat-channel/6.jpg', '今天带大家沉浸式盘点：MBTI 理性天花板——NT分析家组', 'https://weixin.qq.com/sph/AMTltFdKE', 6, 1),
('wechat-channel', '/api/uploads/wechat-channel/7.jpg', '社交电量归零的 NF 人，欢迎回家！', 'https://weixin.qq.com/sph/AG1K0xIXY', 7, 1),
('wechat-channel', '/api/uploads/wechat-channel/8.jpg', 'MBTI空间设计灵感！4大专属兴趣角落 ', 'https://weixin.qq.com/sph/AjwvJ4FtD6', 8, 1),
('wechat-channel', '/api/uploads/wechat-channel/9.jpg', 'MBTI厨房室内设计！进门第1️⃣秒暴露真实性格 📐', 'https://weixin.qq.com/sph/AcCXHDcR1', 9, 1);
