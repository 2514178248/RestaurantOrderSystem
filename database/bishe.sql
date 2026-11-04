-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: bishe
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Current Database: `bishe`
--

/*!40000 DROP DATABASE IF EXISTS `bishe`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bishe` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bishe`;

--
-- Table structure for table `dishes`
--

DROP TABLE IF EXISTS `dishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishes` (
  `dish_id` int NOT NULL AUTO_INCREMENT,
  `dish_name` varchar(255) NOT NULL,
  `dish_price` decimal(10,2) NOT NULL,
  `dish_description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int DEFAULT '1' COMMENT '菜品状态：1-上架，0-下架',
  PRIMARY KEY (`dish_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
INSERT INTO `dishes` VALUES (2,'麻辣香锅',25.00,'麻辣鲜香，配菜丰富','https://pic3.zhimg.com/v2-a385502676a47c6eb0f8e64dd2f178d6_r.jpg','1','2026-03-05 11:47:41','2026-06-07 10:41:54',0),(3,'宫保鸡丁盖饭',16.00,'经典川菜，下饭神器','https://pic1.zhimg.com/v2-e8e1814da5b51295a0c083466d80a96e_r.jpg','1','2026-03-05 11:48:11','2026-05-29 22:54:05',1),(4,'珍珠奶茶',12.00,'香浓醇厚，Q弹珍珠','https://pic2.zhimg.com/v2-78af21cc7e6a5a98086bab1bd860ef83_1440w.jpg','2','2026-03-05 11:49:16','2026-05-29 22:29:01',1),(5,'柠檬蜂蜜水',8.00,'清新解腻，维C满满','https://ts1.tc.mm.bing.net/th/id/R-C.77ea383dae6a6311a0f89f9a6b5fe37d?rik=DPorWXKpUbTgvQ&riu=http%3a%2f%2fwww.kumifeng.com%2fuploadfile%2f2019%2f0904%2f20190904081842766.jpg&ehk=kaL%2bFDA7ikbgcI35CxZRYcJzxfqK1mZ1SIMBV6gi%2fic%3d&risl=&pid=ImgRaw&r=0','2','2026-03-05 11:53:23','2026-04-27 12:32:22',1),(6,'红豆双皮奶',10.00,'香甜嫩滑，经典甜品','https://tse2.mm.bing.net/th/id/OIP.Q3u33IgtQeaal9Zo9LTqlAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3','3','2026-03-05 11:53:57','2026-05-29 22:55:01',1),(7,'炸鸡排',15.00,'外酥里嫩，香脆可口','https://pica.zhimg.com/v2-7839516d3894c68467f09bf591156872_r.jpg','3','2026-03-05 11:56:57','2026-05-29 22:55:36',1),(8,'手抓饼',7.00,'层次分明，香酥美味','https://ts3.tc.mm.bing.net/th/id/OIP-C.6f3Shu_BVuxHMWogcqclYQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3','3','2026-03-05 11:58:55','2026-04-27 12:32:24',1),(9,'鸡蛋炒蔬菜',23.00,NULL,'https://pic4.zhimg.com/v2-28a64f96ebca6a1f3db4bed6a8c210db_r.jpg','1','2026-03-10 15:44:38','2026-05-29 22:56:16',1);
/*!40000 ALTER TABLE `dishes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `detail_id` bigint NOT NULL AUTO_INCREMENT COMMENT '详情ID（主键，自增）',
  `order_id` bigint NOT NULL COMMENT '关联订单主表的order_id',
  `dish_id` bigint NOT NULL COMMENT '关联菜品表的dish_id',
  `dish_name` varchar(50) NOT NULL COMMENT '菜品名称（冗余存储）',
  `dish_price` decimal(10,2) NOT NULL COMMENT '菜品单价',
  `dish_quantity` int NOT NULL DEFAULT '1' COMMENT '菜品数量',
  `dish_image` varchar(255) DEFAULT NULL COMMENT '菜品图片',
  PRIMARY KEY (`detail_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_dish_id` (`dish_id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单详情表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,3,1,'黄焖鸡米饭',18.00,1,NULL),(2,3,3,'宫保鸡丁盖饭',16.00,1,NULL),(3,3,4,'珍珠奶茶',12.00,1,NULL),(4,4,1,'黄焖鸡米饭',18.00,1,NULL),(5,4,3,'宫保鸡丁盖饭',16.00,1,NULL),(6,4,4,'珍珠奶茶',12.00,2,NULL),(7,5,1,'黄焖鸡米饭',18.00,1,NULL),(8,5,3,'宫保鸡丁盖饭',16.00,1,NULL),(9,5,4,'珍珠奶茶',12.00,2,NULL),(10,6,1,'黄焖鸡米饭',18.00,1,NULL),(11,6,4,'珍珠奶茶',12.00,1,NULL),(12,6,3,'宫保鸡丁盖饭',16.00,1,NULL),(13,6,8,'手抓饼',7.00,1,NULL),(14,7,5,'柠檬蜂蜜水',8.00,4,NULL),(15,8,4,'珍珠奶茶',12.00,3,NULL),(16,9,2,'麻辣香锅',25.00,1,NULL),(17,9,4,'珍珠奶茶',12.00,1,NULL),(18,9,7,'炸鸡排',15.00,1,NULL),(19,10,2,'麻辣香锅',25.00,3,NULL),(20,10,4,'珍珠奶茶',12.00,3,NULL),(21,10,8,'手抓饼',7.00,1,NULL),(22,11,4,'珍珠奶茶',12.00,3,NULL),(23,11,6,'红豆双皮奶',10.00,1,NULL),(24,11,7,'炸鸡排',15.00,1,NULL),(25,12,2,'麻辣香锅',25.00,1,NULL),(26,12,4,'珍珠奶茶',12.00,1,NULL),(27,12,9,'鸡蛋炒蔬菜',23.00,1,NULL),(28,13,2,'麻辣香锅',25.00,2,NULL),(29,13,7,'炸鸡排',15.00,5,NULL),(30,14,2,'麻辣香锅',25.00,1,NULL),(31,14,4,'珍珠奶茶',12.00,3,NULL),(32,15,2,'麻辣香锅',25.00,1,NULL),(33,15,9,'鸡蛋炒蔬菜',23.00,2,NULL),(34,15,6,'红豆双皮奶',10.00,1,NULL),(35,16,2,'麻辣香锅',25.00,2,NULL),(36,16,4,'珍珠奶茶',12.00,4,NULL),(37,17,6,'红豆双皮奶',10.00,2,NULL),(38,17,8,'手抓饼',7.00,2,NULL),(39,18,7,'炸鸡排',15.00,2,NULL),(40,18,6,'红豆双皮奶',10.00,1,NULL),(41,19,4,'珍珠奶茶',12.00,2,NULL),(42,19,5,'柠檬蜂蜜水',8.00,3,NULL),(43,19,2,'麻辣香锅',25.00,1,NULL),(44,19,3,'宫保鸡丁盖饭',16.00,1,NULL),(45,20,7,'炸鸡排',15.00,2,NULL),(46,20,6,'红豆双皮奶',10.00,1,NULL),(47,20,2,'麻辣香锅',25.00,1,NULL),(48,20,3,'宫保鸡丁盖饭',16.00,1,NULL),(49,20,5,'柠檬蜂蜜水',8.00,1,NULL),(50,21,2,'麻辣香锅',25.00,1,NULL),(51,21,5,'柠檬蜂蜜水',8.00,1,NULL),(52,21,8,'手抓饼',7.00,1,NULL),(53,21,6,'红豆双皮奶',10.00,1,NULL),(54,28,2,'麻辣香锅',25.00,1,NULL),(55,28,4,'珍珠奶茶',12.00,1,NULL),(56,29,6,'红豆双皮奶',10.00,3,NULL),(57,29,8,'手抓饼',7.00,2,NULL),(58,29,9,'鸡蛋炒蔬菜',23.00,1,NULL),(59,30,6,'红豆双皮奶',10.00,3,NULL),(60,30,8,'手抓饼',7.00,4,NULL),(61,30,9,'鸡蛋炒蔬菜',23.00,2,NULL),(62,31,2,'麻辣香锅',25.00,1,NULL),(63,31,4,'珍珠奶茶',12.00,2,NULL),(64,32,2,'麻辣香锅',25.00,1,NULL),(65,32,4,'珍珠奶茶',12.00,1,NULL),(66,33,2,'麻辣香锅',25.00,1,NULL),(67,33,3,'宫保鸡丁盖饭',16.00,1,NULL),(68,33,7,'炸鸡排',15.00,1,NULL),(69,34,4,'珍珠奶茶',12.00,1,NULL),(70,34,6,'红豆双皮奶',10.00,1,NULL),(71,34,7,'炸鸡排',15.00,1,NULL),(72,35,4,'珍珠奶茶',12.00,1,NULL),(73,35,6,'红豆双皮奶',10.00,2,NULL),(74,36,4,'珍珠奶茶',12.00,1,NULL),(75,36,3,'宫保鸡丁盖饭',16.00,1,NULL),(76,36,5,'柠檬蜂蜜水',8.00,1,NULL),(77,37,2,'麻辣香锅',25.00,1,NULL),(78,37,4,'珍珠奶茶',12.00,1,NULL),(79,37,6,'红豆双皮奶',10.00,1,NULL),(80,38,2,'麻辣香锅',25.00,1,NULL),(81,38,5,'柠檬蜂蜜水',8.00,1,NULL),(82,38,7,'炸鸡排',15.00,1,NULL),(83,39,2,'麻辣香锅',25.00,3,NULL),(84,39,7,'炸鸡排',15.00,1,NULL),(85,39,9,'鸡蛋炒蔬菜',23.00,1,NULL),(86,40,4,'珍珠奶茶',12.00,1,NULL),(87,40,6,'红豆双皮奶',10.00,1,NULL),(88,40,8,'手抓饼',7.00,2,NULL),(89,41,4,'珍珠奶茶',12.00,2,NULL),(90,41,6,'红豆双皮奶',10.00,2,NULL),(91,41,7,'炸鸡排',15.00,1,NULL),(92,42,4,'珍珠奶茶',12.00,2,NULL),(93,42,2,'麻辣香锅',25.00,1,NULL),(94,42,5,'柠檬蜂蜜水',8.00,1,NULL),(95,42,8,'手抓饼',7.00,1,NULL),(96,43,4,'珍珠奶茶',12.00,2,NULL),(97,43,6,'红豆双皮奶',10.00,1,NULL),(98,43,7,'炸鸡排',15.00,1,NULL),(99,43,2,'麻辣香锅',25.00,1,NULL),(100,43,5,'柠檬蜂蜜水',8.00,1,NULL),(101,44,2,'麻辣香锅',25.00,1,NULL),(102,44,4,'珍珠奶茶',12.00,1,NULL),(103,44,5,'柠檬蜂蜜水',8.00,1,NULL),(104,45,2,'麻辣香锅',25.00,1,NULL),(105,45,4,'珍珠奶茶',12.00,1,NULL),(106,45,5,'柠檬蜂蜜水',8.00,1,NULL),(107,46,2,'麻辣香锅',25.00,1,NULL),(108,46,3,'宫保鸡丁盖饭',16.00,1,NULL),(109,46,5,'柠檬蜂蜜水',8.00,1,NULL),(110,47,2,'麻辣香锅',25.00,1,NULL),(111,47,3,'宫保鸡丁盖饭',16.00,1,NULL),(112,48,2,'麻辣香锅',25.00,1,NULL),(113,48,4,'珍珠奶茶',12.00,1,NULL),(114,48,6,'红豆双皮奶',10.00,1,NULL),(115,49,4,'珍珠奶茶',12.00,1,NULL),(116,49,5,'柠檬蜂蜜水',8.00,1,NULL),(117,49,6,'红豆双皮奶',10.00,1,NULL),(118,50,4,'珍珠奶茶',12.00,1,NULL),(119,50,6,'红豆双皮奶',10.00,2,NULL),(120,51,2,'麻辣香锅',25.00,1,NULL),(121,51,4,'珍珠奶茶',12.00,1,NULL),(122,51,6,'红豆双皮奶',10.00,1,NULL),(123,52,2,'麻辣香锅',25.00,1,NULL),(124,52,4,'珍珠奶茶',12.00,1,NULL),(125,52,5,'柠檬蜂蜜水',8.00,3,NULL),(126,53,2,'麻辣香锅',25.00,1,NULL),(127,53,4,'珍珠奶茶',12.00,1,NULL),(128,53,5,'柠檬蜂蜜水',8.00,1,NULL),(129,54,4,'珍珠奶茶',12.00,3,NULL),(130,54,5,'柠檬蜂蜜水',8.00,1,NULL),(131,55,2,'麻辣香锅',25.00,3,NULL),(132,55,3,'宫保鸡丁盖饭',16.00,1,NULL),(133,55,4,'珍珠奶茶',12.00,1,NULL),(134,56,2,'麻辣香锅',25.00,1,NULL),(135,56,3,'宫保鸡丁盖饭',16.00,1,NULL),(136,57,2,'麻辣香锅',25.00,1,NULL),(137,57,4,'珍珠奶茶',12.00,2,NULL),(138,57,5,'柠檬蜂蜜水',8.00,1,NULL);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_main`
--

DROP TABLE IF EXISTS `order_main`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_main` (
  `order_id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '唯一订单编号',
  `user_id` varchar(64) NOT NULL COMMENT '用户openid（字符串类型）',
  `total_amount` decimal(10,2) NOT NULL COMMENT '商品总价（保留2位小数）',
  `pay_status` tinyint NOT NULL DEFAULT '0' COMMENT '0-待支付 1-已支付 2-已完成 3-已取消',
  `table_num` varchar(32) DEFAULT '' COMMENT '桌号',
  `pay_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_main`
--

LOCK TABLES `order_main` WRITE;
/*!40000 ALTER TABLE `order_main` DISABLE KEYS */;
INSERT INTO `order_main` VALUES (3,'20260309107139','oZNCE1-fyDIPT8fCLVu5XeLwUDak',46.00,2,'默认桌号','2026-03-09 18:55:46','2026-03-09 18:55:46'),(4,'20260309802993','oZNCE1-fyDIPT8fCLVu5XeLwUDak',58.00,2,'默认桌号','2026-03-09 18:57:07','2026-03-09 18:57:07'),(5,'20260309194439','oZNCE1-fyDIPT8fCLVu5XeLwUDak',58.00,2,'默认桌号','2026-03-09 18:57:55','2026-03-09 18:57:55'),(6,'20260309903902','oZNCE1-fyDIPT8fCLVu5XeLwUDak',53.00,2,'默认桌号','2026-03-09 18:59:55','2026-03-09 18:59:55'),(7,'20260309248563','oZNCE1-fyDIPT8fCLVu5XeLwUDak',32.00,2,'默认桌号','2026-03-09 19:01:05','2026-03-09 19:01:05'),(8,'20260309698853','oZNCE1-fyDIPT8fCLVu5XeLwUDak',36.00,2,'默认桌号','2026-03-09 19:03:13','2026-03-09 19:03:13'),(9,'20260311463330','oZNCE1-fyDIPT8fCLVu5XeLwUDak',52.00,2,'默认桌号','2026-03-11 15:07:32','2026-03-11 15:07:32'),(10,'20260311787362','oZNCE1-fyDIPT8fCLVu5XeLwUDak',118.00,2,'默认桌号','2026-03-11 15:43:09','2026-03-11 15:43:09'),(11,'20260317268021','oZNCE1-fyDIPT8fCLVu5XeLwUDak',61.00,2,'默认桌号','2026-03-17 22:35:19','2026-03-17 22:35:19'),(12,'20260317521731','oZNCE1-fyDIPT8fCLVu5XeLwUDak',60.00,2,'默认桌号','2026-03-17 22:38:11','2026-03-17 22:38:11'),(13,'20260427424357','oZNCE1-fyDIPT8fCLVu5XeLwUDak',125.00,3,'默认桌号','2026-04-27 16:47:06','2026-04-27 16:47:06'),(21,'20260504948387','oZNCE1-fyDIPT8fCLVu5XeLwUDak',50.00,2,'食堂4楼取餐点','2026-05-04 15:32:41','2026-05-04 15:32:41'),(28,'20260505695662','oZNCE1-fyDIPT8fCLVu5XeLwUDak',37.00,2,'食堂1楼取餐点','2026-05-05 00:48:53','2026-05-05 00:48:53'),(29,'20260506134080','oZNCE1-fyDIPT8fCLVu5XeLwUDak',67.00,2,'食堂3楼取餐点','2026-05-06 18:07:52','2026-05-06 18:07:52'),(31,'20260506918569','oZNCE1-fyDIPT8fCLVu5XeLwUDak',49.00,2,'食堂1楼取餐点','2026-05-06 19:17:21','2026-05-06 19:17:21'),(32,'20260508221353','oZNCE1-fyDIPT8fCLVu5XeLwUDak',37.00,2,'食堂1楼取餐点','2026-05-08 21:15:02','2026-05-08 21:15:02'),(33,'20260508826054','oZNCE1-fyDIPT8fCLVu5XeLwUDak',56.00,2,'食堂2楼取餐点','2026-05-08 21:55:24','2026-05-08 21:55:24'),(34,'20260508263749','oZNCE1-fyDIPT8fCLVu5XeLwUDak',37.00,2,'食堂2楼取餐点','2026-05-08 21:58:21','2026-05-08 21:58:21'),(35,'20260508958729','oZNCE1-fyDIPT8fCLVu5XeLwUDak',32.00,2,'食堂2楼取餐点','2026-05-08 23:56:44','2026-05-08 23:56:44'),(36,'20260509548909','oZNCE1-fyDIPT8fCLVu5XeLwUDak',36.00,2,'食堂2楼取餐点','2026-05-09 01:26:56','2026-05-09 01:26:56'),(37,'20260529968842','oZNCE19Ia90cmlkIvx99WyfurhYU',47.00,2,'食堂3楼取餐点','2026-05-29 23:17:18','2026-05-29 23:17:18'),(38,'20260606182902','oZNCE1-fyDIPT8fCLVu5XeLwUDak',48.00,2,'食堂2楼取餐点','2026-06-06 14:46:45','2026-06-06 14:46:45'),(39,'20260606704242','oZNCE1-fyDIPT8fCLVu5XeLwUDak',113.00,2,'食堂3楼取餐点','2026-06-06 14:48:12','2026-06-06 14:48:12'),(40,'20260606991592','oZNCE1-fyDIPT8fCLVu5XeLwUDak',36.00,2,'食堂1楼取餐点','2026-06-06 22:51:45','2026-06-06 22:51:45'),(41,'20260606321303','oZNCE1-fyDIPT8fCLVu5XeLwUDak',59.00,2,'食堂3楼取餐点','2026-06-06 23:16:46','2026-06-06 23:16:46'),(42,'20260606376883','oZNCE1-fyDIPT8fCLVu5XeLwUDak',64.00,2,'食堂3楼取餐点','2026-06-06 23:18:18','2026-06-06 23:18:18'),(43,'20260606414089','oZNCE1-fyDIPT8fCLVu5XeLwUDak',82.00,2,'食堂3楼取餐点','2026-06-06 23:33:15','2026-06-06 23:33:15'),(44,'20260606824109','oZNCE1-fyDIPT8fCLVu5XeLwUDak',45.00,2,'食堂3楼取餐点','2026-06-06 23:33:56','2026-06-06 23:33:56'),(45,'20260606135620','oZNCE1-fyDIPT8fCLVu5XeLwUDak',45.00,2,'食堂3楼取餐点','2026-06-06 23:34:10','2026-06-06 23:34:10'),(46,'20260606568173','oZNCE1-fyDIPT8fCLVu5XeLwUDak',49.00,2,'食堂3楼取餐点','2026-06-06 23:34:29','2026-06-06 23:34:29'),(47,'20260606805183','oZNCE1-fyDIPT8fCLVu5XeLwUDak',41.00,3,'食堂3楼取餐点','2026-06-06 23:35:26','2026-06-06 23:35:26'),(48,'20260606782447','oZNCE1-fyDIPT8fCLVu5XeLwUDak',47.00,2,'食堂3楼取餐点','2026-06-06 23:39:51','2026-06-06 23:39:51'),(49,'20260606875446','oZNCE1-fyDIPT8fCLVu5XeLwUDak',30.00,3,'食堂3楼取餐点','2026-06-06 23:43:14','2026-06-06 23:43:14'),(50,'20260606390189','oZNCE1-fyDIPT8fCLVu5XeLwUDak',32.00,2,'食堂3楼取餐点','2026-06-06 23:43:51','2026-06-06 23:43:51'),(51,'20260606169107','oZNCE1-fyDIPT8fCLVu5XeLwUDak',47.00,2,'食堂3楼取餐点','2026-06-06 23:44:42','2026-06-06 23:44:42'),(52,'20260606352429','oZNCE1-fyDIPT8fCLVu5XeLwUDak',61.00,2,'食堂3楼取餐点','2026-06-06 23:45:52','2026-06-06 23:45:52'),(53,'20260606316776','oZNCE1-fyDIPT8fCLVu5XeLwUDak',45.00,3,'食堂3楼取餐点','2026-06-06 23:47:07','2026-06-06 23:47:07'),(54,'20260606361807','oZNCE1-fyDIPT8fCLVu5XeLwUDak',44.00,2,'食堂3楼取餐点','2026-06-06 23:59:46','2026-06-06 23:59:46'),(55,'20260607701075','oZNCE1-fyDIPT8fCLVu5XeLwUDak',103.00,2,'食堂3楼取餐点','2026-06-07 00:26:49','2026-06-07 00:26:49'),(56,'20260607609074','oZNCE1-fyDIPT8fCLVu5XeLwUDak',41.00,2,'食堂1楼取餐点','2026-06-07 00:28:33','2026-06-07 00:28:33'),(57,'20260607580534','oZNCE1-fyDIPT8fCLVu5XeLwUDak',57.00,2,'食堂3楼取餐点','2026-06-07 10:40:57','2026-06-07 10:40:57');
/*!40000 ALTER TABLE `order_main` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tel-number` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `updateTime` datetime DEFAULT NULL,
  `openid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2,'13576850381','13576850381','','2026-05-04 18:04:38','2026-05-04 18:04:38','oZNCE1-fyDIPT8fCLVu5XeLwUDak'),(6,'18179307062','18179307062','','2026-05-29 23:16:39','2026-05-29 23:16:39','oZNCE19Ia90cmlkIvx99WyfurhYU');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vue_user`
--

DROP TABLE IF EXISTS `vue_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vue_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vue_user`
--

LOCK TABLES `vue_user` WRITE;
/*!40000 ALTER TABLE `vue_user` DISABLE KEYS */;
INSERT INTO `vue_user` VALUES (1,'LJL','$2a$10$DrShSwvaj7PLanxy9DGCGewvkqtQSASHOjcvUXpyyAukCGolB6h.e','13576850381','2514178248@qq.com','2026-05-29 22:21:59');
/*!40000 ALTER TABLE `vue_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 15:54:50
