# 智慧餐厅点餐系统 — 项目架构与技术栈总览

> 面向校园/食堂场景的三端一体在线点餐系统：顾客微信小程序点餐 → Spring Boot 后端处理 → 商家 Vue 后台管理，并通过 WebSocket 实现实时推送。

---

## 一、项目总体架构

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  微信小程序（顾客端）     │         │  Vue3 商家后台（商家端）   │
│  CanYingDianDan          │         │  ShangJiaHoutai          │
│  端口: 微信开发者工具      │         │  npm run dev → :5173     │
└────────────┬─────────────┘         └────────────┬─────────────┘
             │ HTTP: /api/**（直连 8080）          │ HTTP: /api/**（Vite 代理→8080）
             │ WebSocket: ws://host:8080/ws/orders│ WebSocket: /ws/orders（Vite ws 代理）
             └──────────────────┬─────────────────┘
                                ▼
                ┌───────────────────────────────┐
                │   Spring Boot 后端 :8080       │
                │   CanTingJieKou               │
                │   REST + WebSocket 广播        │
                └──────────────┬────────────────┘
                               │ JDBC（MyBatis-Plus）
                               ▼
                ┌───────────────────────────────┐
                │   MySQL 8（bishe 库）:3306     │
                │   dishes / order_main /       │
                │   order_detail / user /       │
                │   vue_user                    │
                └───────────────────────────────┘
```

### 三端业务闭环

```
顾客下单(new_order推送) → 商家后台实时弹提醒 → 商家接单/标记完成(status_change推送)
→ 小程序实时同步状态 → 顾客完成取餐；商家上下架菜品(dish_change推送) → 小程序菜品实时显隐
```

---

## 二、技术栈

| 端 | 技术 | 版本 | 用途 |
|---|---|---|---|
| 顾客端 | 微信小程序原生框架 | 基础库 3.8.x | 页面/组件/生命周期 |
| 顾客端 | WXSS + Flex/Grid 布局 | — | 样式与响应式布局（rpx） |
| 顾客端 | CommonJS 模块化 | — | utils 工具封装 |
| 后端 | Java | 21 | 运行环境 |
| 后端 | Spring Boot | 3.2.5 | Web 容器 + REST 接口 |
| 后端 | spring-boot-starter-websocket | 随 Boot | WebSocket 实时推送 |
| 后端 | MyBatis-Plus | 3.5.9 | ORM / 条件构造器 / 分页 |
| 后端 | MySQL Connector/J | 8.4.0 | 数据库驱动 |
| 后端 | FastJSON | 2.0.43 | JSON 序列化（缓存/推送） |
| 后端 | Lombok | 1.18.34 | 简化实体代码 |
| 后端 | spring-security-crypto（BCrypt） | 随 Boot | 商家密码加密存储 |
| 数据库 | MySQL | 8.x | 持久化（库名 bishe） |
| 商家端 | Vue | 3.5 | 前端框架（Composition API + `<script setup>`） |
| 商家端 | Vite（rolldown-vite） | 7.x | 构建工具 + 开发代理 |
| 商家端 | Element Plus | 2.x | UI 组件库 |
| 商家端 | Vue Router | 4.x | 页面路由 |
| 商家端 | Axios | 1.x | HTTP 请求（baseURL=/api） |
| 商家端 | ECharts | 6.x | 销量/营收数据可视化 |
| 商家端 | Sass | — | 样式预处理 |
| 实时通信 | WebSocket（端点 /ws/orders） | — | 订单/菜品状态实时推送 |

---

## 三、目录结构与各层职责

### 1. `CanYingDianDan/` — 顾客端微信小程序

```
CanYingDianDan/
├── app.js                     # 应用入口：全局数据(cart/openid/userInfo)、启动初始化
├── app.json                   # 全局配置：页面路由注册、tabBar（首页/购物车/我的）
├── app.wxss                   # 全局样式、主题变量
├── pages/                     # ★ 页面层：每页四件套(.js 逻辑/.wxml 结构/.wxss 样式/.json 配置)
│   ├── index/                 # 首页：菜品列表加载、分类过滤、搜索、加购、WS 订阅 dish_change
│   ├── cart/                  # 购物车：数量增减、单选/全选、总价计算、去结算
│   ├── order-confirm/         # 订单确认：取餐信息、提交订单(POST /order/submit)
│   ├── payment-success/       # 支付成功：结果展示、倒计时跳转
│   ├── meal-location/         # 取餐地点编辑与保存
│   ├── order-list/            # 订单列表：本地+后端订单合并、状态筛选、WS 订阅 status_change
│   ├── order-detail/          # 订单详情：立即支付/取消订单、WS 订阅按 orderId 刷新
│   ├── login/                 # 登录：手机号+openid 静默登录
│   └── user-center/           # 用户中心：订单统计、订单号查询、退出登录
├── components/
│   └── navigation-bar/        # 自定义导航栏组件
├── utils/                     # ★ 工具层：全项目的公共能力封装
│   ├── config.js              # ★ 后端 baseUrl（唯一需要按环境修改的文件）
│   ├── http.js                # HTTP 请求框架：统一 URL 拼接、超时、错误处理、业务码判断
│   ├── api.js                 # API 接口定义层：user/order/goods 等接口的统一出口
│   ├── websocket.js           # WebSocket 单例：自动连接、断线 5s 重连、多页面订阅/退订
│   └── storage.js             # 本地持久化：购物车/订单/用户信息的 wx.setStorageSync 封装
├── images/                    # 静态图片资源
└── project.config.json        # 微信开发者工具配置（appid 等）
```

**小程序分层规则**：页面只做「渲染 + 事件绑定」，网络请求走 `http.js → api.js`，实时更新走 `websocket.js`，本地缓存走 `storage.js`。

### 2. `CanTingJieKou/` — 核心后端（Spring Boot）

```
CanTingJieKou/
├── pom.xml                    # Maven 依赖（Spring Boot 3.2.5 / WebSocket / MyBatis-Plus / MySQL）
├── mvnw / mvnw.cmd / .mvn/    # Maven Wrapper（无需本机装 Maven）
└── src/main/
    ├── java/com/example/cantingjiekou/
    │   ├── CanTingJieKouApplication.java   # 启动类
    │   ├── config/            # ★ 配置层
    │   │   ├── WebConfig.java              # CORS 白名单（/api/** 允许 5173/5174 等来源）
    │   │   ├── WebSocketConfig.java        # 注册 WS 端点 ws://host:8080/ws/orders
    │   │   ├── OrderWebSocketHandler.java  # WS 处理器：连接池管理 + broadcast(type, payload) 广播
    │   │   ├── SecurityConfig.java         # Spring Security 放行配置
    │   │   └── MyMetaObjectHandler.java    # MyBatis-Plus 字段自动填充
    │   ├── controller/        # ★ 接口层：接收请求、参数校验、统一 JSON 返回 {code, msg, data}
    │   │   ├── DishController.java        # 菜品 CRUD + 上下架（上下架后广播 dish_change）
    │   │   ├── OrderController.java       # 下单/订单列表/详情/状态变更/统计（关键动作后广播推送）
    │   │   ├── UserController.java        # 小程序端用户：wx.login code 换 openid、手机号登录
    │   │   └── VueUserController.java     # 商家后台账号：注册/登录（BCrypt 校验）
    │   ├── service/           # ★ 业务层：核心业务逻辑（impl 为实现类）
    │   │   ├── DishService(+Impl)         # 菜品业务
    │   │   ├── OrderService(+Impl)        # 下单、商家订单分页查询、状态字符串↔数字映射、统计聚合
    │   │   └── VueUserService(+Impl)
    │   ├── mapper/            # ★ 数据访问层：MyBatis-Plus BaseMapper + 自定义 @Select SQL
    │   │   ├── DishMapper.java / OrderMapper.java / OrderItemMapper.java
    │   │   ├── UserMapper.java / VueUserMapper.java
    │   ├── entity/            # ★ 实体层：与数据库表一一对应（Lombok 注解简化）
    │   │   ├── Dish.java                  # dishes 表
    │   │   ├── Order.java                 # order_main 表（含 payStatus 状态字段）
    │   │   ├── OrderItem.java             # order_detail 表（订单明细）
    │   │   ├── User.java / VueUser.java   # 小程序用户 / 商家账号
    │   └── utils/
    │       └── WxUtil.java                # 调微信 code2session 接口换 openid
    └── resources/
        └── application.properties         # ★ 数据库连接、wx app-id/secret、MyBatis-Plus 配置
```

**请求处理链路**：`Controller（校验/封装响应）→ Service（业务逻辑/状态映射）→ Mapper（SQL）→ MySQL`

**WebSocket 消息类型**（`OrderWebSocketHandler.broadcast` 广播给所有已连接客户端）：

| type | 触发时机 | payload | 消费方 |
|---|---|---|---|
| `new_order` | 小程序提交订单成功 | `{orderId, orderNo, amount}` | 商家后台弹提醒+刷新列表 |
| `status_change` | 支付/取消/标记完成成功 | `{orderId, status, payStatus}` | 商家后台 + 小程序订单页自动刷新 |
| `dish_change` | 商家菜品上架/下架 | `{dishId, status}` | 小程序首页实时显示/隐藏菜品 |

### 3. `ShangJiaHoutai/` — 商家管理后台

```
ShangJiaHoutai/
├── Myapplication/             # ★ Vue3 商家后台前端（现行主链路）
│   ├── package.json           # 依赖与脚本（dev/build/preview）
│   ├── vite.config.js         # 代理：/api → localhost:8080；/ws → localhost:8080（ws:true）
│   ├── index.html             # 单页入口
│   └── src/
│       ├── main.js            # 入口：注册 Element Plus、axios baseURL='/api'
│       ├── App.vue            # 根组件
│       ├── router/index.js    # 路由表：/login /register /dashboard /orders /products /trends /sales
│       ├── layout/
│       │   └── MainLayout.vue # 侧边导航布局（登录后的页面框架）
│       └── views/             # ★ 页面层
│           ├── Login.vue / Register.vue     # 商家登录/注册（→ /api/login、/api/register）
│           ├── Dashboard.vue                # 运营看板：今日订单数/销售额汇总
│           ├── OrderList.vue                # 订单管理：筛选/分页/标记完成(带确认弹窗)/WS 自动刷新
│           ├── ProductList.vue              # 菜品管理：CRUD、上下架（→ /api/dishes/**）
│           ├── OrderTrends.vue              # 销售趋势折线图（ECharts）
│           └── ProductSales.vue             # 菜品销量排行柱状图（ECharts）
│
└── backend/                   # ⚠️ 早期遗留的 Express 服务（server.js，端口 3000）
                               # 现行登录注册已由 Spring Boot 的 VueUserController 承担，
                               # 此目录仅作历史参考，不在主链路中
```

---

## 四、核心机制说明

### 1. 订单状态机（payStatus / 字符串双表示）

| 数字 | 字符串（后端） | 小程序端叫法 | 商家后台显示 | 说明 |
|---|---|---|---|---|
| 0 | pending | pending | 待支付 | 刚提交，可取消/支付 |
| 1 | processing | paid | 待完成 | 已支付，商家可「标记完成」 |
| 2 | completed | completed | 已完成 | 商家确认完成 |
| 3 | cancelled | cancelled | 已取消 | 用户取消或商家取消 |

> ⚠️ 注意：后端字符串 `processing` 与小程序字符串 `paid` 指同一个状态（数字 1）。推送消息里的 `payStatus` 是数字，客户端按数字映射显示，避免字符串不一致问题。

### 2. 实时推送链路（WebSocket）

- 端点：`ws://host:8080/ws/orders`；浏览器经 Vite `ws` 代理，小程序直连。
- 后端 `OrderWebSocketHandler` 维护 `CopyOnWriteArraySet<WebSocketSession>` 连接池，`broadcast()` 向所有在线客户端群发 JSON 消息。
- 关键动作后广播：提交订单 → `new_order`；支付/取消/标记完成 → `status_change`；菜品上下架 → `dish_change`。
- 客户端：收到对应 type 后重新拉取数据（Cache/接口刷新），实现「无刷新同步」；`utils/websocket.js` 提供断线自动重连。

### 3. 商家订单列表查询规则

- `OrderMapper.selectAdminOrderList`：**包含待支付订单**，按 `order_id DESC` 排序（保证新订单在第一页第一条）；支持订单号/状态/日期区间筛选与分页。
- 统计类接口（Dashboard/销量/月营收）只统计已支付+已完成（pay_status IN (1,2)）。

### 4. 安全与认证

- 商家密码：BCrypt 加密存储（spring-security-crypto），登录时 BCrypt 校验。
- 小程序身份：`wx.login` code → 后端 `WxUtil` 调微信接口换 openid → 手机号绑定登录。
- CORS：`WebConfig` 白名单放行 `localhost:5173/5174` 与局域网 IP 来源。

---

## 五、端口与启动方式

| 服务 | 端口 | 启动命令 | 目录 |
|---|---|---|---|
| MySQL | 3306 | Windows 服务（库名 bishe） | — |
| Spring Boot 后端 | 8080 | `mvnw.cmd spring-boot:run` | `CanTingJieKou/` |
| Vue 商家后台 | 5173/5174 | `npm run dev` | `ShangJiaHoutai/Myapplication/` |
| 微信小程序 | — | 微信开发者工具导入 `CanYingDianDan/`（勾选"不校验合法域名"） | `CanYingDianDan/` |

### 需要按环境修改的配置

| 文件 | 配置项 | 说明 |
|---|---|---|
| `CanTingJieKou/src/main/resources/application.properties` | `spring.datasource.username/password`、`wx.app-id/app-secret` | MySQL 账号、微信小程序凭据 |
| `CanYingDianDan/utils/config.js` | `baseUrl` | 电脑调试用 `127.0.0.1`，真机调试改成电脑局域网 IP |
| `ShangJiaHoutai/Myapplication/vite.config.js` | proxy target | 后端不在本机时修改 |

---

*文档版本：v1.0 ｜ 更新日期：2026-11-17 ｜ 对应当前代码实际状态（含 WebSocket 实时推送功能）*
