# 馋影点点 - 快速开始指南

## ⚡ 快速启动

### 1. 项目初始化

```bash
# 使用微信开发者工具打开项目文件夹
# 选择: 文件 → 打开 → 选择 CanYingDianDan 文件夹
```

### 2. 基础配置

编辑 `project.config.json` 配置：
```json
{
  "appid": "YOUR_WECHAT_APPID",
  "projectname": "馋影点点",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true
  }
}
```

### 3. 配置后端 API

编辑 `utils/http.js`：
```javascript
const API_BASE_URL = 'https://your-backend-api.com/api';
```

## 🔧 主要功能模块使用示例

### 导入 Storage 工具

```javascript
const Storage = require('../../utils/storage');

// 获取购物车
const cart = Storage.getCart();

// 保存购物车
Storage.setCart(cart);

// 获取订单
const order = Storage.getOrder(orderId);

// 添加新订单
const newOrder = Storage.addOrder({
  goods: [...],
  totalPrice: 100,
  mealLocation: {...}
});
```

### 导入 API 工具

```javascript
const API = require('../../utils/api');

// 获取商品列表
API.goods.getList(categoryId)
  .then(data => {
    console.log('商品列表:', data);
  })
  .catch(error => {
    console.error('获取失败:', error.message);
  });

// 创建订单
API.order.create(orderData)
  .then(result => {
    console.log('订单创建成功:', result);
  })
  .catch(error => {
    wx.showToast({
      title: error.message,
      icon: 'none'
    });
  });
```

## 📋 核心页面功能介绍

### 首页 (pages/index)
**核心功能**: 商品展示、搜索、分类

```javascript
// 添加商品到购物车
addToCart(e) {
  const goods = e.currentTarget.dataset.goods;
  const cart = Storage.getCart();
  
  const existingIndex = cart.findIndex(item => item.id === goods.id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({...goods, quantity: 1, selected: true});
  }
  
  Storage.setCart(cart);
  this.updateCartBadge(); // 更新购物车角标
}
```

### 购物车页面 (pages/cart)
**核心功能**: 购物车管理、价格计算、结算

```javascript
// 计算总价
calculateTotal() {
  const { cartList } = this.data;
  let totalPrice = 0;
  
  cartList.forEach(item => {
    if (item.selected) {
      totalPrice += item.price * item.quantity;
    }
  });
  
  this.setData({ totalPrice });
}

// 结算
checkout() {
  const selectedGoods = this.data.cartList.filter(i => i.selected);
  if (selectedGoods.length === 0) {
    wx.showToast({title: '请选择商品', icon: 'none'});
    return;
  }
  
  wx.navigateTo({
    url: '/pages/order-confirm/order-confirm'
  });
}
```

### 订单确认页 (pages/order-confirm)
**核心功能**: 订单确认、支付

```javascript
// 模拟支付
payOrder() {
  this.setData({ paying: true });
  
  setTimeout(() => {
    // 创建订单
    const order = Storage.addOrder({
      goods: this.data.selectedGoods,
      totalPrice: this.data.totalPrice,
      mealLocation: this.data.mealLocation,
      status: 'paid'
    });
    
    // 清空购物车
    Storage.clearCart();
    
    // 跳转成功页面
    wx.redirectTo({
      url: `/pages/payment-success/payment-success?orderId=${order.orderId}`
    });
  }, 1500);
}
```

### 用户中心页 (pages/user-center)
**核心功能**: 用户信息、订单统计、订单查询

```javascript
// 获取用户信息
getUserProfile() {
  wx.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      const userInfo = res.userInfo;
      Storage.setUserInfo(userInfo);
      this.setData({ userInfo });
    }
  });
}

// 加载订单统计
loadOrderStats() {
  const orders = Storage.getOrdersByStatus('all');
  const stats = {
    waitingPay: orders.filter(o => o.status === 'pending').length,
    waitingReceive: orders.filter(o => o.status === 'paid').length,
    completed: orders.filter(o => o.status === 'completed').length
  };
  this.setData({ orders: stats });
}
```

## 🎯 常见开发任务

### 任务 1: 修改商品列表

编辑 `pages/index/index.js` 的 `loadGoodsList()` 方法：

```javascript
loadGoodsList() {
  // 使用实际 API 替换模拟数据
  API.goods.getList()
    .then(data => {
      this.setData({
        goodsList: data,
        filteredGoodsList: data
      });
    })
    .catch(error => {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
}
```

### 任务 2: 实现真实微信支付

编辑 `pages/order-confirm/order-confirm.js`:

```javascript
payOrder() {
  const { selectedGoods, totalPrice } = this.data;
  
  // 调用后端获取支付参数
  API.payment.requestWeChatPay({
    orderId: generateOrderId(),
    amount: Math.round(totalPrice * 100), // 微信支付使用分
    body: '餐饮订单'
  })
  .then(paymentData => {
    // 发起支付
    wx.requestPayment({
      ...paymentData,
      success: () => {
        // 支付成功处理
        this.handlePaymentSuccess();
      },
      fail: () => {
        wx.showToast({title: '支付失败', icon: 'none'});
      }
    });
  });
}
```

### 任务 3: 添加新页面

1. 在 `pages/` 创建新文件夹
2. 创建 4 个文件: `.js`, `.wxml`, `.wxss`, `.json`
3. 在 `app.json` 的 `pages` 数组中添加路径

```json
{
  "pages": [
    "pages/index/index",
    "pages/your-new-page/your-new-page"
  ]
}
```

## 🐛 常见问题解决

### 问题 1: 购物车数据丢失
**解决**: 检查浏览器本地存储是否被清除
```javascript
// 在 app.js onLaunch 中恢复数据
const cart = Storage.getCart();
if (cart) {
  this.globalData.cart = cart;
}
```

### 问题 2: 页面导航失败
**解决**: 检查 `app.json` 中的页面路径是否正确
```json
{
  "pages": ["pages/index/index"] // 不要使用 pages/index/index.js
}
```

### 问题 3: 网络请求超时
**解决**: 增加请求超时时间或检查后端服务
```javascript
// 在 http.js 中添加超时配置
const requestConfig = {
  // ... 其他配置
  timeout: 15000 // 15秒超时
};
```

## 📊 数据结构参考

### 商品对象
```javascript
{
  id: 1,
  name: '黄焖鸡米饭',
  description: '鲜嫩多汁，营养丰富',
  price: 18.00,
  image: '/images/goods1.jpg',
  categoryId: 1
}
```

### 购物车项
```javascript
{
  ...商品对象,
  quantity: 2,      // 数量
  selected: true    // 是否选中
}
```

### 订单对象
```javascript
{
  orderId: 'ORD1234567890',
  goods: [购物车项, ...],
  totalPrice: 100.00,
  totalCount: 5,
  mealLocation: {
    location: '食堂3楼取餐点',
    phone: '13800138000'
  },
  status: 'paid',            // pending/paid/completed/cancelled
  paymentMethod: 'weixin',
  createTime: 1234567890000,
  updateTime: 1234567890000
}
```

## 🚀 部署建议

### 测试阶段
1. 在开发者工具中预览和调试
2. 使用微信开发者工具的预览功能测试真机

### 正式发布
1. 配置正式的后端 API 地址
2. 测试真实微信支付流程
3. 完成小程序上线审核流程
4. 配置生产环境的 AppID

## 📞 技术参考

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序 API 参考](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [微信支付文档](https://pay.weixin.qq.com/wiki?id=new/develop/payment-guide.shtml)
