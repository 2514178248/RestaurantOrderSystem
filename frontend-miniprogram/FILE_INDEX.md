# 📑 项目文件索引

快速查找和访问项目中的所有文件。

---

## 📂 目录导航

### 📱 页面文件 (Pages)

| 页面 | 功能 | 文件路径 |
|------|------|---------|
| 首页 | 商品展示、搜索、分类 | `pages/index/` |
| 购物车 | 购物车管理、结算 | `pages/cart/` |
| 订单确认 | 订单审核、支付 | `pages/order-confirm/` |
| 支付成功 | 支付结果展示 | `pages/payment-success/` |
| 取餐地点 | 地点编辑、保存 | `pages/meal-location/` |
| 订单列表 | 订单查询、筛选 | `pages/order-list/` |
| 订单详情 | 订单详情、操作 | `pages/order-detail/` |
| 用户中心 | 用户管理、登录 | `pages/user-center/` |

#### 页面文件详细路径

**首页**
```
pages/index/
  ├── index.js          (商品加载、搜索、分类逻辑)
  ├── index.wxml        (页面布局)
  ├── index.wxss        (样式设计)
  └── index.json        (组件注册)
```

**购物车**
```
pages/cart/
  ├── cart.js           (购物车管理逻辑)
  ├── cart.wxml         (购物车布局)
  ├── cart.wxss         (购物车样式)
  └── cart.json         (组件注册)
```

**订单确认**
```
pages/order-confirm/
  ├── order-confirm.js  (订单确认逻辑)
  ├── order-confirm.wxml (订单确认布局)
  ├── order-confirm.wxss (订单确认样式)
  └── order-confirm.json (组件注册)
```

**支付成功**
```
pages/payment-success/
  ├── payment-success.js
  ├── payment-success.wxml
  ├── payment-success.wxss
  └── payment-success.json
```

**取餐地点编辑**
```
pages/meal-location/
  ├── meal-location.js
  ├── meal-location.wxml
  ├── meal-location.wxss
  └── meal-location.json
```

**订单列表**
```
pages/order-list/
  ├── order-list.js
  ├── order-list.wxml
  ├── order-list.wxss
  └── order-list.json
```

**订单详情**
```
pages/order-detail/
  ├── order-detail.js
  ├── order-detail.wxml
  ├── order-detail.wxss
  └── order-detail.json
```

**用户中心**
```
pages/user-center/
  ├── user-center.js
  ├── user-center.wxml
  ├── user-center.wxss
  └── user-center.json
```

---

### 🧩 自定义组件 (Components)

```
components/
  └── navigation-bar/           (自定义导航栏)
      ├── navigation-bar.js     (导航栏逻辑)
      ├── navigation-bar.wxml   (导航栏模板)
      ├── navigation-bar.wxss   (导航栏样式)
      └── navigation-bar.json   (组件配置)
```

---

### 🛠️ 工具模块 (Utils)

```
utils/
  ├── storage.js               (本地存储工具 - 购物车、订单、用户数据管理)
  ├── http.js                  (HTTP请求工具 - 网络请求框架)
  └── api.js                   (API接口定义 - 所有API接口的定义)
```

**Storage 模块功能**
- `getCart()` / `setCart()` - 购物车操作
- `getUserInfo()` / `setUserInfo()` - 用户信息操作
- `getMealLocation()` / `setMealLocation()` - 取餐地点操作
- `getOrder()` / `addOrder()` - 订单操作
- `getOrdersByStatus()` - 按状态查询订单

**HTTP 模块功能**
- `get()` - GET 请求
- `post()` - POST 请求
- `put()` - PUT 请求
- `delete()` - DELETE 请求
- `request()` - 核心请求方法

**API 模块接口**
- `goods.*` - 商品接口
- `order.*` - 订单接口
- `user.*` - 用户接口
- `payment.*` - 支付接口
- `cart.*` - 购物车接口

---

### ⚙️ 应用配置文件

```
app.js                         (应用入口、全局数据管理)
app.json                       (应用配置、页面路由、tabBar配置)
app.wxss                       (全局样式)
project.config.json            (微信开发者工具配置)
project.private.config.json    (私密本地配置)
sitemap.json                   (SEO收录配置)
```

---

### 📚 文档文件

```
README.md                      (项目说明、架构文档)
QUICK_START.md                 (快速开始指南、使用示例)
API_SPEC.md                    (API接口规范、后端需实现)
PROJECT_SUMMARY.md             (项目完成总结、统计数据)
PROJECT_STRUCTURE.txt          (项目结构可视化说明)
CHECKLIST.md                   (项目验收清单)
FAQ.md                         (常见问题解答)
DELIVERY_SUMMARY.txt           (项目交付总结)
FILE_INDEX.md                  (本文件 - 文件索引)
```

---

## 🔍 按功能快速查找

### 商品相关功能

| 功能 | 文件 | 关键函数/方法 |
|------|------|-------------|
| 获取商品列表 | pages/index/index.js | `loadGoodsList()` |
| 搜索商品 | pages/index/index.js | `onSearchInput()`, `filterGoods()` |
| 分类过滤 | pages/index/index.js | `switchCategory()` |
| 添加到购物车 | pages/index/index.js | `addToCart()` |

### 购物车相关功能

| 功能 | 文件 | 关键函数/方法 |
|------|------|-------------|
| 加载购物车 | pages/cart/cart.js | `loadCart()` |
| 选中/取消选中 | pages/cart/cart.js | `toggleGoodsSelected()` |
| 全选/取消全选 | pages/cart/cart.js | `toggleSelectAll()` |
| 修改数量 | pages/cart/cart.js | `increaseQuantity()`, `decreaseQuantity()` |
| 删除商品 | pages/cart/cart.js | `deleteGoods()` |
| 计算总价 | pages/cart/cart.js | `calculateTotal()` |
| 结算 | pages/cart/cart.js | `checkout()` |

### 订单相关功能

| 功能 | 文件 | 关键函数/方法 |
|------|------|-------------|
| 订单确认 | pages/order-confirm/order-confirm.js | `loadOrderData()` |
| 支付订单 | pages/order-confirm/order-confirm.js | `payOrder()`, `handlePaymentSuccess()` |
| 取消订单 | pages/order-confirm/order-confirm.js | `cancelOrder()` |
| 订单列表 | pages/order-list/order-list.js | `loadOrders()` |
| 订单详情 | pages/order-detail/order-detail.js | `loadOrderDetail()` |
| 再次购买 | pages/order-list/order-list.js | `reorder()` |

### 用户相关功能

| 功能 | 文件 | 关键函数/方法 |
|------|------|-------------|
| 用户登录 | pages/user-center/user-center.js | `login()` |
| 获取用户信息 | pages/user-center/user-center.js | `getUserInfo()` |
| 订单统计 | pages/user-center/user-center.js | `loadOrderStats()` |
| 订单查询 | pages/user-center/user-center.js | `searchOrder()` |
| 退出登录 | pages/user-center/user-center.js | `logout()` |

### 取餐地点管理

| 功能 | 文件 | 关键函数/方法 |
|------|------|-------------|
| 编辑取餐地点 | pages/meal-location/meal-location.js | `selectLocation()` |
| 保存地点信息 | pages/meal-location/meal-location.js | `saveMealLocation()` |

---

## 🔗 按文件快速查找

### 如果要修改...

**商品显示**
→ 编辑 `pages/index/index.wxml` 和 `pages/index/index.wxss`

**购物车样式**
→ 编辑 `pages/cart/cart.wxss`

**订单确认流程**
→ 编辑 `pages/order-confirm/order-confirm.js`

**用户登录逻辑**
→ 编辑 `pages/user-center/user-center.js`

**API 接口**
→ 编辑 `utils/api.js`

**网络请求设置**
→ 编辑 `utils/http.js`

**本地存储逻辑**
→ 编辑 `utils/storage.js`

**应用配置**
→ 编辑 `app.json`

**全局样式**
→ 编辑 `app.wxss`

**应用初始化**
→ 编辑 `app.js`

---

## 📖 按功能需求快速查找文档

### 快速开始？
→ 阅读 **QUICK_START.md**

### 了解项目架构？
→ 阅读 **README.md** 和 **PROJECT_STRUCTURE.txt**

### 后端如何实现接口？
→ 阅读 **API_SPEC.md**

### 遇到问题？
→ 查看 **FAQ.md**

### 项目统计和总结？
→ 阅读 **PROJECT_SUMMARY.md**

### 功能是否完整？
→ 查看 **CHECKLIST.md**

### 项目完成情况？
→ 阅读 **DELIVERY_SUMMARY.txt**

---

## 🎯 按开发任务快速查找

### 任务 1: 实现真实支付

**相关文件**:
- `pages/order-confirm/order-confirm.js` - 支付逻辑
- `utils/api.js` - API 定义
- `API_SPEC.md` - API 规范

**修改点**:
1. 将 `payOrder()` 中的模拟支付改为真实支付
2. 在 `api.js` 中调用后端支付接口
3. 按照 `API_SPEC.md` 实现支付接口

### 任务 2: 从服务器获取商品

**相关文件**:
- `pages/index/index.js` - 商品加载
- `utils/api.js` - API 定义
- `API_SPEC.md` - API 规范

**修改点**:
1. 编辑 `loadGoodsList()` 方法
2. 使用 `API.goods.getList()` 替代模拟数据
3. 按照 `API_SPEC.md` 实现商品接口

### 任务 3: 添加新页面

**相关文件**:
- `app.json` - 页面路由注册
- 新页面文件夹

**修改点**:
1. 在 `pages/` 创建新文件夹
2. 创建四个必要文件 (.js, .wxml, .wxss, .json)
3. 在 `app.json` 中注册页面路由

### 任务 4: 集成用户认证

**相关文件**:
- `pages/user-center/user-center.js` - 用户管理
- `utils/http.js` - HTTP 请求
- `app.js` - 全局初始化

**修改点**:
1. 在 `login()` 中实现真实登录
2. 在 `http.js` 中添加认证头
3. 在 `app.js` 中初始化用户信息

---

## 📊 文件大小概览

| 文件类型 | 数量 | 代码行数 |
|---------|------|---------|
| JavaScript | 11 | ~1500 |
| WXML | 8 | ~600 |
| WXSS | 8 | ~1200 |
| JSON | 10 | ~200 |
| Markdown | 6 | ~4000 |
| 其他 | 3 | ~100 |
| **总计** | **53** | **~8900** |

---

## 🔐 文件权限说明

### 核心功能文件（不应删除）
- ✅ 所有 pages 文件
- ✅ 所有 utils 文件
- ✅ app.js, app.json
- ✅ 所有文档文件

### 可选替换文件（可按需修改）
- 📝 components 文件（可选择自定义）
- 📝 app.wxss（可自定义全局样式）
- 📝 图片资源（需替换为实际资源）

---

## 🚀 快速导航快捷键

**要快速找到某个文件？**

1. 在项目中使用 Ctrl+P 快速打开文件
2. 输入文件名即可快速定位
3. 例如: `cart.js`, `storage.js`, `README.md`

**要快速查找某个函数？**

1. 使用 Ctrl+F 在当前文件中搜索
2. 使用 Ctrl+Shift+F 在整个项目中搜索
3. 例如: `addToCart`, `loadGoodsList`, `checkout`

---

## 📞 需要帮助？

- 🔍 查找文件: 使用本索引和 Ctrl+P
- 📖 阅读文档: 从 README.md 开始
- ❓ 常见问题: 查看 FAQ.md
- 🔧 技术细节: 参考相应的 .js 文件注释

---

**最后更新**: 2024年1月19日  
**文档版本**: v1.0

---

**快速链接**:
- [项目说明](README.md)
- [快速开始](QUICK_START.md)
- [API规范](API_SPEC.md)
- [常见问题](FAQ.md)
- [项目总结](PROJECT_SUMMARY.md)
