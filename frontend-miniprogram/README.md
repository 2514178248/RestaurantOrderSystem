# 馋影点点 - 微信小程序点单系统

一个完整的微信小程序点单系统，支持从点单、购物车、订单确认、支付到订单管理的全流程。

## 🎯 项目特性

### 核心功能模块

#### 1. 首页 (pages/index)
- ✅ 商品分类导航（支持横向滚动）
- ✅ 快速搜索功能（实时匹配）
- ✅ 推荐商品展示（网格布局）
- ✅ 响应式页面设计（适配多种屏幕）
- ✅ 购物车角标实时更新

#### 2. 购物车页面 (pages/cart)
- ✅ 商品列表展示
- ✅ 单个商品勾选/取消勾选
- ✅ 全选/取消全选功能
- ✅ 数量加减操作
- ✅ 商品删除（左滑或按钮）
- ✅ 实时价格计算
- ✅ 结算按钮（验证选中商品）

#### 3. 订单确认页 (pages/order-confirm)
- ✅ 取餐信息展示和编辑
- ✅ 商品清单确认
- ✅ 金额显示
- ✅ 微信支付（模拟支付）
- ✅ 取消订单功能

#### 4. 支付成功页 (pages/payment-success)
- ✅ 成功提示展示
- ✅ 订单号显示
- ✅ 倒计时自动跳转
- ✅ 查看订单详情

#### 5. 订单列表页 (pages/order-list)
- ✅ 按状态分类显示订单
- ✅ 订单卡片展示
- ✅ 再次购买功能
- ✅ 订单详情查看

#### 6. 订单详情页 (pages/order-detail)
- ✅ 完整订单信息展示
- ✅ 订单状态跟踪
- ✅ 商品详情展示
- ✅ 费用明细
- ✅ 支付和取消操作

#### 7. 用户中心页 (pages/user-center)
- ✅ 用户信息展示
- ✅ 用户授权登录
- ✅ 订单统计
- ✅ 订单查询功能
- ✅ 取餐信息管理
- ✅ 退出登录

#### 8. 取餐地点编辑页 (pages/meal-location)
- ✅ 取餐地点选择
- ✅ 联系电话输入
- ✅ 信息保存和更新

## 📁 项目结构

```
CanYingDianDan/
├── pages/                          # 所有页面
│   ├── index/                      # 首页
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   ├── cart/                       # 购物车页面
│   │   ├── cart.js
│   │   ├── cart.wxml
│   │   ├── cart.wxss
│   │   └── cart.json
│   ├── order-confirm/             # 订单确认页面
│   │   ├── order-confirm.js
│   │   ├── order-confirm.wxml
│   │   ├── order-confirm.wxss
│   │   └── order-confirm.json
│   ├── payment-success/           # 支付成功页面
│   │   ├── payment-success.js
│   │   ├── payment-success.wxml
│   │   ├── payment-success.wxss
│   │   └── payment-success.json
│   ├── meal-location/             # 取餐地点编辑页面
│   │   ├── meal-location.js
│   │   ├── meal-location.wxml
│   │   ├── meal-location.wxss
│   │   └── meal-location.json
│   ├── order-list/                # 订单列表页面
│   │   ├── order-list.js
│   │   ├── order-list.wxml
│   │   ├── order-list.wxss
│   │   └── order-list.json
│   ├── order-detail/              # 订单详情页面
│   │   ├── order-detail.js
│   │   ├── order-detail.wxml
│   │   ├── order-detail.wxss
│   │   └── order-detail.json
│   └── user-center/               # 用户中心页面
│       ├── user-center.js
│       ├── user-center.wxml
│       ├── user-center.wxss
│       └── user-center.json
│
├── components/                     # 自定义组件
│   └── navigation-bar/            # 自定义导航栏
│       ├── navigation-bar.js
│       ├── navigation-bar.json
│       ├── navigation-bar.wxml
│       └── navigation-bar.wxss
│
├── utils/                          # 工具函数
│   ├── storage.js                 # 本地存储管理
│   ├── http.js                    # 网络请求工具
│   └── api.js                     # API 接口定义
│
├── app.js                         # 应用入口文件
├── app.json                       # 应用配置
├── app.wxss                       # 应用全局样式
├── project.config.json            # 项目配置
└── sitemap.json                   # 页面收录配置
```

## 🚀 数据流管理

### 本地存储 (Storage Module)

#### 购物车数据结构
```javascript
{
  id: 1,
  name: '商品名称',
  price: 18.00,
  quantity: 1,
  selected: true,
  image: '/images/goods1.jpg',
  categoryId: 1
}
```

#### 订单数据结构
```javascript
{
  orderId: 'ORD1234567890',
  goods: [...], // 商品列表
  totalPrice: 50.00,
  totalCount: 3,
  mealLocation: {
    location: '食堂3楼取餐点',
    phone: '13800138000'
  },
  status: 'paid', // pending, paid, completed, cancelled
  createTime: 1234567890000,
  updateTime: 1234567890000
}
```

### 状态管理

使用微信小程序的 Page 数据和全局 App 数据管理应用状态：

- **Page 数据**: 页面级的响应式数据
- **全局数据**: 跨页面共享的数据（如购物车、用户信息）
- **本地存储**: 持久化数据（购物车、订单、用户信息）

## 🔄 页面流程

### 用户购物流程

```
首页 → 搜索/分类浏览 → 加入购物车 → 购物车 → 结算
    ↓
订单确认 → 修改取餐信息 → 支付 → 支付成功
    ↓
用户中心 → 查看订单列表 → 订单详情 → 再次购买
```

### 关键交互

1. **添加购物车**: 检查是否已存在，如存在则数量+1
2. **结算**: 验证选中商品，跳转到订单确认页
3. **订单确认**: 显示默认取餐信息，支持修改
4. **支付**: 模拟支付流程，生成订单
5. **订单查询**: 支持通过订单号快速查找

## 🛠️ 工具模块

### Storage 模块 (utils/storage.js)

提供本地数据持久化管理：

```javascript
// 购物车操作
Storage.getCart()       // 获取购物车
Storage.setCart(data)   // 保存购物车
Storage.clearCart()     // 清空购物车

// 用户信息
Storage.getUserInfo()   // 获取用户信息
Storage.setUserInfo(data) // 保存用户信息

// 取餐信息
Storage.getMealLocation() // 获取取餐信息
Storage.setMealLocation(data) // 保存取餐信息

// 订单管理
Storage.addOrder(data)  // 添加订单
Storage.getOrder(orderId) // 获取订单详情
Storage.updateOrderStatus(orderId, status) // 更新订单状态
Storage.getOrdersByStatus(status) // 按状态获取订单列表
```

### HTTP 模块 (utils/http.js)

处理所有网络请求：

```javascript
HttpRequest.get(url, options)     // GET 请求
HttpRequest.post(url, data, options) // POST 请求
HttpRequest.put(url, data, options)  // PUT 请求
HttpRequest.delete(url, options)  // DELETE 请求
```

### API 模块 (utils/api.js)

定义所有 API 接口：

```javascript
// 商品
API.goods.getList(categoryId)
API.goods.getDetail(goodsId)
API.goods.search(keyword)

// 订单
API.order.create(orderData)
API.order.getList(status)
API.order.getDetail(orderId)
API.order.updateStatus(orderId, status)
API.order.cancel(orderId)
API.order.pay(orderId, paymentData)

// 用户
API.user.login(code)
API.user.getInfo()
API.user.updateInfo(userData)

// 支付
API.payment.requestWeChatPay(orderData)
API.payment.queryPaymentStatus(orderId)

// 购物车
API.cart.sync(cartData)
API.cart.get()
```

## 🎨 样式设计

### 色彩方案
- 主色: #1296db (蓝色)
- 强调色: #ff6b35 (橙色)
- 文字色: #333333 (深灰)
- 辅助色: #999999 (浅灰)
- 背景色: #f5f5f5 (极浅灰)

### 响应式设计
- 使用 `rpx` (微信小程序响应式像素单位)
- 采用 Grid 和 Flex 布局
- 支持多种屏幕尺寸自适应

## 📱 已支持的功能

### 核心业务逻辑
- ✅ 购物车管理（增删改查）
- ✅ 订单创建和管理
- ✅ 订单状态跟踪
- ✅ 用户信息管理
- ✅ 本地数据持久化
- ✅ 搜索和分类筛选

### 用户交互
- ✅ 实时价格计算
- ✅ 表单验证
- ✅ 加载状态提示
- ✅ 错误提示和确认弹窗
- ✅ 购物车角标显示

## 🔌 后端集成指南

### API 基础路径配置

编辑 `utils/http.js` 中的 `API_BASE_URL`:

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### 后端需实现的接口

#### 1. 商品相关

```
GET  /api/goods/list?categoryId=xx        // 获取商品列表
GET  /api/goods/:goodsId                  // 获取商品详情
GET  /api/goods/search?keyword=xx         // 搜索商品
```

#### 2. 订单相关

```
POST /api/order/create                    // 创建订单
GET  /api/order/list?status=xx            // 获取订单列表
GET  /api/order/:orderId                  // 获取订单详情
PUT  /api/order/:orderId/status           // 更新订单状态
PUT  /api/order/:orderId/cancel           // 取消订单
POST /api/order/:orderId/pay              // 订单支付
```

#### 3. 用户相关

```
POST /api/user/login                      // 用户登录
GET  /api/user/info                       // 获取用户信息
PUT  /api/user/info                       // 更新用户信息
```

#### 4. 支付相关

```
POST /api/payment/wechat                  // 请求微信支付
GET  /api/payment/:orderId/status         // 查询支付状态
```

#### 5. 购物车相关（可选）

```
POST /api/cart/sync                       // 同步购物车
GET  /api/cart                            // 获取购物车
```

## 🧪 测试建议

### 本地测试
1. 使用微信开发者工具预览
2. 启用调试模式查看控制台输出
3. 测试各个页面的导航流程

### 功能测试清单
- [ ] 商品搜索和分类筛选
- [ ] 添加商品到购物车
- [ ] 购物车数量增删
- [ ] 全选/反选功能
- [ ] 结算流程
- [ ] 取餐信息编辑
- [ ] 订单查询
- [ ] 用户登录/退出

## 📝 开发注意事项

1. **权限声明**: 需要在 `app.json` 中声明必要的权限
2. **性能优化**: 大列表建议使用虚拟滚动
3. **错误处理**: 所有网络请求都应包含错误处理
4. **数据验证**: 提交订单前验证所有必要数据
5. **用户提示**: 使用 `wx.showToast` 和 `wx.showModal` 提示用户

## 🔐 安全建议

1. 敏感信息（如用户 ID）不应存储在本地
2. 支付相关数据应通过加密传输
3. 验证用户操作（如删除订单）
4. 实现请求超时机制

## 📞 技术支持

如有问题，请检查：
1. 微信小程序 SDK 版本
2. 后端 API 是否正常运行
3. 本地存储是否被清除
4. 网络连接是否正常

## 📄 许可证

本项目为学习和开发参考，可自由使用和修改。
