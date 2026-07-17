-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: yashe_db
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `yashe_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `yashe_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `yashe_db`;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'邓小善','845712457@qq.com','92300940','窗外设计','30-50万','我要做一个窗纱设计 你们可以做吗',0,'2026-06-30 10:59:22');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知??',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知?容',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '公告' COMMENT '公告 / 优惠 / ??提醒 / 活?',
  `status` tinyint DEFAULT '1' COMMENT '1=?布 0=?藏',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站?通知';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (2,'欢迎加入雅舍室内设计中心','注册登录会员可享更多权益','公告',1,'2026-07-07 14:23:45','2026-07-07 14:23:45'),(3,'恭喜钟小姐荣获禅城区手抓饼大赛一等奖','恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖','公告',1,'2026-07-07 14:38:38','2026-07-07 14:38:38'),(4,'恭喜邓小姐荣获禅城区手抓饼大赛一等奖','恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖','公告',1,'2026-07-07 14:38:46','2026-07-07 14:38:46'),(5,'恭喜钟小姐荣获禅城区手抓饼大赛一等奖','恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖','公告',1,'2026-07-07 14:38:48','2026-07-07 14:38:48'),(6,'恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖','恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖恭喜钟小姐荣获禅城区手抓饼大赛一等奖','公告',1,'2026-07-07 14:38:51','2026-07-07 14:38:51');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_codes`
--

DROP TABLE IF EXISTS `promo_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '隡???',
  `discount` decimal(5,2) DEFAULT NULL COMMENT '???瘥??嚗??0.9=9???',
  `amount` decimal(10,2) DEFAULT NULL COMMENT '?菜????嚗??2000.00=?菜?2000???',
  `max_uses` int DEFAULT '100' COMMENT '??之雿輻?甈⊥?',
  `used_count` int DEFAULT '0' COMMENT '撌脖蝙?冽活?',
  `valid_from` date DEFAULT NULL COMMENT '????交?',
  `valid_until` date DEFAULT NULL COMMENT '憭望??交?',
  `status` tinyint DEFAULT '1' COMMENT '1=??? 0=???',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='隡????”';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_codes`
--

LOCK TABLES `promo_codes` WRITE;
/*!40000 ALTER TABLE `promo_codes` DISABLE KEYS */;
INSERT INTO `promo_codes` VALUES (1,'YASHE2024',0.90,NULL,200,0,NULL,NULL,1,'2026-06-25 10:46:25'),(2,'WELCOME2000',NULL,2000.00,500,0,NULL,NULL,1,'2026-06-25 10:46:25'),(3,'VIP888',0.85,NULL,100,0,NULL,NULL,1,'2026-06-25 10:46:25');
/*!40000 ALTER TABLE `promo_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `project` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客??价';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,'沙发装修项目',3,'我很满意 因为这个设计挺不错的','2026-06-30 10:47:10'),(2,1,'花园建设项目',5,'体验非常好 我很满意啊','2026-06-30 10:47:45'),(3,1,'阳台建设项目',5,'三房两厅很舒服啊 包括南北对流','2026-07-07 14:32:16');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_promos`
--

DROP TABLE IF EXISTS `user_promos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_promos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `promo_id` bigint NOT NULL,
  `used_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `promo_id` (`promo_id`),
  CONSTRAINT `user_promos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_promos_ibfk_2` FOREIGN KEY (`promo_id`) REFERENCES `promo_codes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='?冽?隡????蝙?刻扇敶';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_promos`
--

LOCK TABLES `user_promos` WRITE;
/*!40000 ALTER TABLE `user_promos` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_promos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '憪??',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?桃拳嚗??敶?揭?瘀?',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '????',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '撖??嚗?Crypt???嚗',
  `promo_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '隡???',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'member' COMMENT '閫??嚗?ember / admin',
  `status` tinyint DEFAULT '1' COMMENT '?嗆?嚗?=甇?虜 0=蝳??',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='?冽?銵';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'jimo73','954074916@qq.com','18138489930','$2a$10$ssFojpeGCcbZbAfXh2CtaOhn4WnCpdyo.v6Vx3Jht9WaOx6sI4Vvq',NULL,'admin',1,'2026-06-25 11:01:22','2026-06-26 15:56:56'),(2,'MR.LI','1010732927@qq.com','13928572661','$2a$10$kpuDixu83HRLONQgfgjDU.6zV4IGF3Z.ptcpNGHVPRxfMIF2zSNBe',NULL,'member',1,'2026-06-26 11:50:50','2026-06-26 11:50:50'),(3,'sanzo','2052647853@qq.com','17164253389','$2a$10$gIO5sCGV1vYvpjJpbE3EPO3JaY/SBJqzDFzhEK5cUUBakZwfV6dZm',NULL,'member',1,'2026-06-26 14:43:11','2026-06-26 14:43:11'),(4,'管理员','admin@yashe.design',NULL,'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',NULL,'admin',1,'2026-06-26 15:41:28','2026-06-26 15:41:28'),(5,'abc123','4040567135@qq.com','13654781225','$2a$10$pu2/Ep/EGvzahNhxb74mt.NbDykBHDjtHVQl9SWJ8gU0v6B0qqcMK',NULL,'member',1,'2026-06-27 10:30:10','2026-06-27 10:30:10'),(6,'abc122','954074911@qq.com','154785699256','$2a$10$QQUPEOiq4EUgZUGDrc2//uEmmBe0YAyJJoW58wJ1eRtKJyT7L1N.2',NULL,'member',1,'2026-06-27 14:47:21','2026-06-27 14:47:21'),(7,'钟小姐','6457231458@qq.com','17914688856','$2a$10$d9mvBKVCZaLGMOxEaTaPNO9JIjlb9ztz9iYK4K/lzXie/D8TMzY8S',NULL,'member',1,'2026-06-29 15:14:05','2026-06-29 15:14:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'yashe_db'
--

--
-- Dumping routines for database 'yashe_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17 10:40:24
