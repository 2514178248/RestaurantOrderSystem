# RestaurantOrderSystem（餐厅点餐系统）

一个面向校园/食堂场景的 **微信小程序 + Spring Boot 后端 + Vue 商家管理后台** 三端一体的在线点餐系统。
顾客在微信小程序里浏览菜单、加购、下单、查看订单；商家在 Web 后台注册登录后，查看订单流水、菜品销量、销售趋势。

> 本仓库由原来分散的三个 GitHub 仓库合并而来：`CanYingDianDan`（小程序）、`CanTingJieKou`（Spring Boot 接口）、`ShangJiaHoutai`（商家后台）。现已整理为单仓库多模块结构。

---

## 一、功能一览

### 顾客端（微信小程序 `frontend-miniprogram/`）
- 微信一键登录（`wx.login` + 后端换取 openid）
- 菜单浏览（按分类：盖饭 / 饮品 / 甜品小食）、菜品详情
- 购物车本地缓存、去结算、选择取餐点（食堂 1/2/3/4 楼）
- 提交订单 → 模拟支付（直接置为已支付）
- 我的订单列表、订单详情、取消订单
- 个人中心

### 商家端（Vue 后台 `admin-web/`）
- 商家账号注册 / 登录（密码 BCrypt 加密存储）
- 运营 Dashboard
- 订单列表、订单状态流转
- 菜品管理（上下架、改价、改库存标记）
- 销售趋势图（ECharts 折线）、菜品销量排行（ECharts 柱状）

### 后端（Spring Boot `backend-springboot/`）
- 统一 REST 接口 `/api/**`，同时服务小程序和 Vue 后台
- 微信小程序 code2session 换取 openid
- MyBatis-Plus 操作 MySQL 8
- `spring.jpa.hibernate.ddl-auto=update` 启动时自动补表结构
- 启动时自动创建 `vue_user` 商家表（见 `VueUserController#initTable`）

---

## 二、技术栈

| 端 | 技术 | 版本 |
| --- | --- | --- |
| 顾客端 | 微信小程序原生框架（WXML/WXSS/JS） | 基础库 latest |
| 顾客端 | 微信开发者工具 | 稳定版 |
| 商家前端 | Vue 3 + Vite (rolldown-vite) | Vue 3.5 / Vite 7 |
| 商家前端 | Element Plus + @element-plus/icons-vue | 2.x |
| 商家前端 | Vue Router | 4.x |
| 商家前端 | Axios | 1.x |
| 商家前端 | ECharts | 6.x |
| 后端 | Java | 21 |
| 后端 | Spring Boot | 3.2.5 |
| 后端 | MyBatis-Plus (spring-boot3-starter) | 3.5.9 |
| 后端 | MySQL Connector/J | 8.4.0 |
| 后端 | FastJSON | 2.0.43 |
| 后端 | Lombok | 1.18.34 |
| 后端 | spring-security-crypto（BCrypt 密码加密） | 随 Boot 版本 |
| 数据库 | MySQL | 8.x（`bishe` 库） |
| 构建 | Maven（mvnw 已内置） | 随 Boot parent |
| 包管理 | npm | Node.js ≥ 18 推荐 |

---

## 三、系统架构

```
┌──────────────────────┐         ┌──────────────────────┐
│  微信小程序（C 端）    │         │  Vue3 商家后台（B 端） │
│  frontend-miniprogram │         │     admin-web        │
│  微信开发者工具运行     │         │  npm run dev :5173   │
└─────────┬────────────┘         └──────────┬───────────┘
          │ https://host:8080/api/*         │ /api/* (vite proxy → 8080)
          │                                 │
          └──────────────┬──────────────────┘
                         ▼
            ┌────────────────────────┐
            │  Spring Boot 后端 :8080 │
            │  backend-springboot    │
            │  (CanTingJiekouApp)    │
            └────────────┬───────────┘
                         │ JDBC
                         ▼
            ┌────────────────────────┐
            │   MySQL 8  库名 bishe   │
            │  dishes / order_main   │
            │  order_detail / user   │
            │       / vue_user       │
            └────────────────────────┘
```

---

## 四、目录结构

```
RestaurantOrderSystem/
├── frontend-miniprogram/      # 顾客端：微信小程序源码
│   ├── app.js / app.json / app.wxss
│   ├── pages/                 # 首页 / 购物车 / 下单 / 订单 / 我的
│   ├── components/
│   ├── images/
│   ├── utils/
│   │   ├── config.js          # ★ 后端 baseUrl，需要改成本机地址
│   │   ├── api.js
│   │   ├── http.js
│   │   └── storage.js
│   └── project.config.json
│
├── backend-springboot/        # 后端：Spring Boot 3 + MyBatis-Plus
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/main/
│       ├── java/com/example/cantingjiekou/
│       │   ├── CanTingJieKouApplication.java
│       │   ├── config/        # Security / Web / Wx / MetaObject
│       │   ├── controller/    # Dish / Order / User / VueUser
│       │   ├── entity/        # Dish / Order / OrderItem / User / VueUser
│       │   ├── mapper/
│       │   ├── service/
│       │   └── utils/         # WxUtil
│       └── resources/
│           └── application.properties   # ★ 数据库账号密码、小程序 appid/secret
│
├── admin-web/                 # 商家端：Vue3 + Vite + Element Plus
│   ├── package.json
│   ├── vite.config.js         # ★ proxy /api → http://localhost:8080
│   ├── index.html
│   └── src/
│       ├── main.js / App.vue
│       ├── router/
│       ├── layout/
│       ├── views/             # Login / Register / Dashboard / OrderList /
│       │                     # ProductList / OrderTrends / ProductSales
│       ├── components/
│       └── assets/
│
└── database/
    ├── bishe.sql              # ★ 完整库结构 + 演示数据（dishes / orders / users）
    └── README.md              # 数据库导入说明
```

---

## 五、环境要求

在开始之前，请先装好：

| 软件 | 版本建议 | 用途 |
| --- | --- | --- |
| JDK | 21 | 跑 Spring Boot |
| Maven | 3.8+（或直接用项目自带 `mvnw.cmd`） | 构建后端 |
| MySQL | 8.x | 数据库，监听 3306 |
| Node.js | ≥ 18（推荐 20 LTS） | 跑商家前端 |
| npm | 随 Node 一起 | 装前端依赖 |
| 微信开发者工具 | 最新稳定版 | 跑小程序 |

---

## 六、快速开始（5 步跑起来）

### 步骤 1：启动 MySQL 并导入数据库

确保本地 MySQL 8 服务已启动，账号密码与下面一致（或自行改 `application.properties`）：

```
host: localhost
port: 3306
username: root
password: 123456789
```

在命令行执行导入（会自动 `CREATE DATABASE bishe` 并建表+灌入演示数据）：

```bash
mysql -uroot -p123456789 < database/bishe.sql
```

详细说明、备选导入方式、表结构介绍见 [`database/README.md`](./database/README.md)。

> 如果你不想导入演示数据，也可以手动 `CREATE DATABASE bishe;` 后直接启动后端——Hibernate 会自动建空表。

### 步骤 2：启动 Spring Boot 后端（端口 8080）

```bash
cd backend-springboot
./mvnw spring-boot:run        # Windows 用 mvnw.cmd spring-boot:run
```

看到日志 `Started CanTingJieKouApplication` 即成功。验证：
浏览器访问 http://localhost:8080/api/goods/list 应能返回菜品 JSON。

> 如果你的 MySQL 密码不是 `123456789`，先改 `backend-springboot/src/main/resources/application.properties` 里的 `spring.datasource.password`。

### 步骤 3：启动商家后台前端（端口 5173）

```bash
cd admin-web
npm install
npm run dev
```

浏览器打开 http://localhost:5173 ，点「注册」创建一个商家账号即可登录。
（vite 已配置 proxy，`/api` 自动转发到 `http://localhost:8080`，无需额外改跨域。）

### 步骤 4：跑微信小程序（顾客端）

1. 打开 **微信开发者工具** → 导入项目 → 选择目录 `frontend-miniprogram/`
2. AppID 可以使用测试号，或填你自己的小程序 AppID
   （项目里默认写的是 `wx0fc00aa8e117656c`，对应后端 `application.properties` 里的 `wx.app-secret`，公开仓库里建议替换成你自己的）
3. 修改后端地址：打开 `frontend-miniprogram/utils/config.js`
   ```js
   const baseUrl = 'http://127.0.0.1:8080';   // 电脑上跑后端就写 127.0.0.1
   // 真机调试时改成电脑在局域网的 IP，例如 'http://192.168.x.x:8080'
   ```
4. 编译预览即可。

> 注意：微信开发者工具 → 详情 → 本地设置，要勾选 **「不校验合法域名 / TLS 版本以及 HTTPS 证书」**，否则 http 请求会被拦。

### 步骤 5（可选）：微信登录真机能跑通需要做的事

小程序里的 `wx.login` 换 openid 依赖后端 `WxUtil` 调微信官方接口，需要有效的 `wx.app-id` + `wx.app-secret`。
如果你只是想跑通菜单、加购、下单流程，不接真实微信登录，可以在小程序里直接点登录按钮走 mock 分支，或在后端把 `/api/user/openid` 临时返回一个固定 openid。

---

## 七、关键配置一览（需要按本机改的地方）

| 配置文件 | 配置项 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `backend-springboot/src/main/resources/application.properties` | `spring.datasource.url` | `jdbc:mysql://localhost:3306/bishe` | 改 MySQL 地址/库名 |
| 同上 | `spring.datasource.username` / `password` | `root` / `123456789` | 改成你本机的 MySQL 账号 |
| 同上 | `wx.app-id` / `wx.app-secret` | 作者的小程序凭据 | **公开仓库请务必替换成自己的** |
| `frontend-miniprogram/utils/config.js` | `baseUrl` | `http://172.20.10.3:8080` | 改成后端实际地址 |
| `admin-web/vite.config.js` | `server.proxy./api.target` | `http://localhost:8080` | 后端不在本机时改这里 |
| `frontend-miniprogram/project.config.json` | `appid` | 作者的 appid | 导入开发者工具时会提示替换 |

---

## 八、演示数据说明

`database/bishe.sql` 里包含以下可直接看到的数据：

- `dishes`：8 道菜品（麻辣香锅 / 宫保鸡丁盖饭 / 珍珠奶茶 / 柠檬蜂蜜水 / 红豆双皮奶 / 炸鸡排 / 手抓饼 / 鸡蛋炒蔬菜），分 3 个分类
- `order_main` / `order_detail`：30+ 条历史订单，商家后台「订单列表 / 销售趋势 / 菜品销量」图表有数据可看
- `vue_user`：1 个商家账号 `admin`（密码是 BCrypt hash，**不知明文**，建议自己点注册新建一个）
- `user`：2 个微信用户 openid（已脱敏为 `oTEST...` 假值，仅用于联调）

> SQL 中的 openid、手机号、邮箱均已脱敏为示例值（`oTEST...` / `1380000000x` / `admin@example.com`），可直接公开。

---

## 九、常见问题

**Q1：启动后端报 `Communications link failure` / `Access denied for user 'root'`**
→ MySQL 没起，或者密码不对。检查 `application.properties` 里的 datasource 配置。

**Q2：小程序请求后端报 `request:fail url not in domain list`**
→ 微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名…」。

**Q3：小程序真机调试白屏/请求不通**
→ 手机和电脑必须在同一局域网，且 `config.js` 里的 `baseUrl` 要写电脑的局域网 IP（`ipconfig` 查），不能写 `127.0.0.1`。

**Q4：商家后台登录报 401**
→ `vue_user` 表里没有该账号，去 `/register` 注册一个，或确认后端已连上 `bishe` 库。

**Q5：ECharts 图没数据**
→ `order_main` 表里没订单。用小程序下一单，或直接导入 `database/bishe.sql` 里的演示数据。

---

## 十、License & 致谢

个人毕业设计项目，仅供学习参考。菜品图片来自知乎/必应公开图床，如有侵权请联系删除。
