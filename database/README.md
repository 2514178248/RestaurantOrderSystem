# 数据库部署说明

本项目使用 **MySQL 8.x**，库名固定为 `bishe`。本目录下的 `bishe.sql` 是作者开发环境导出的完整库结构 + 演示数据。

---

## 一、环境要求

- MySQL 8.0+（大小写不敏感、`utf8mb4` 字符集）
- 监听端口 `3306`
- 一个拥有 `CREATE DATABASE` 权限的账号（一般是 `root`）

---

## 二、表清单

导入后 `bishe` 库会有 5 张表：

| 表名 | 作用 | 对应后端实体 |
| --- | --- | --- |
| `dishes` | 菜品（名称、价格、描述、图片 URL、分类、上下架状态） | `entity/Dish.java` |
| `order_main` | 订单主表（订单号、openid、总金额、状态、取餐点、时间） | `entity/Order.java` |
| `order_detail` | 订单明细（订单 ID、菜品 ID、名称、单价、数量） | `entity/OrderItem.java` |
| `user` | 微信 C 端用户（openid、昵称、手机号） | `entity/User.java` |
| `vue_user` | 商家后台账号（用户名、BCrypt 密码、邮箱、手机号） | `entity/VueUser.java` |

> 表结构由 MyBatis-Plus 映射，下划线 ↔ 驼峰自动转换。后端 `spring.jpa.hibernate.ddl-auto=update` 启动时也会自动补字段，所以即使你不导 SQL，只要建一个空 `bishe` 库，后端跑起来后表也会自动建好（只是没数据）。

---

## 三、导入方式

### 方式 A：命令行导入（推荐）

```bash
# Windows
mysql -uroot -p bishe < database/bishe.sql

# 如果你本机 root 密码不是 123456789，替换成你自己的密码
# 执行后会提示 Enter password: 输入即可
```

Linux / macOS 同理。

### 方式 B：用 Navicat / DBeaver / MySQL Workbench

1. 先手动 `CREATE DATABASE bishe DEFAULT CHARSET utf8mb4;`
2. 选中 `bishe` 库 → 运行 SQL 文件 → 选 `database/bishe.sql` → 执行

### 方式 C：跳过 SQL，自动建空表

如果你不想导入演示数据，只想要干净环境：

```sql
CREATE DATABASE IF NOT EXISTS bishe DEFAULT CHARSET utf8mb4;
```

然后启动 Spring Boot 后端，Hibernate 会自动建好 5 张空表。
之后你需要：
- 在 `vue_user` 表里没有数据 → 去商家后台 `/register` 注册一个账号
- 在 `dishes` 表里没有菜品 → 通过商家后台「菜品管理」加，或手动 INSERT

---

## 四、连接配置（与后端对齐）

导入完数据库后，确认后端连接配置与之一致：
`backend-springboot/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bishe?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456789
```

如果你本机的 MySQL 密码不是 `123456789`，改 `spring.datasource.password` 这一行即可，**不要改 SQL 文件**。

---

## 五、导出你自己的库（可选）

如果你后续改了表结构或数据，想重新导出给别人用：

```bash
mysqldump -uroot -p \
  --databases bishe \
  --add-drop-database --add-drop-table \
  --default-character-set=utf8mb4 \
  > database/bishe.sql
```

---

## 六、已脱敏说明

`bishe.sql` 在打包进本仓库前已经做过脱敏处理：

| 敏感字段 | 原始值示例 | 已替换为 |
| --- | --- | --- |
| 微信 openid（`user.openid` / `order_main.user_id`） | `oZNCE1-fyD...` | `oTEST000000000000000000000001` / `...002` |
| C 端用户手机号（`user.tel-number`） | `13576850381` 等 | `13800000001` / `13800000002` |
| 商家账号（`vue_user.username`） | `LJL` | `admin` |
| 商家手机号（`vue_user.phone`） | 真实手机号 | `13800000001` |
| 商家邮箱（`vue_user.email`） | 真实 QQ 邮箱 | `admin@example.com` |

如果你是在本地自己重新 dump 的库，想公开前再脱敏一遍，可执行：

```sql
USE bishe;
UPDATE user SET tel-number='13800000001', nickname='13800000001', openid='oTEST000000000000000000000001' WHERE openid LIKE 'oZ%';
UPDATE order_main SET user_id='oTEST000000000000000000000001' WHERE user_id LIKE 'oZ%';
UPDATE vue_user SET username='admin', phone='13800000001', email='admin@example.com' WHERE id=1;
```
