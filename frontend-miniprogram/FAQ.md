# ❓ 常见问题解答 (FAQ)

本文档列出开发者在使用本项目时可能遇到的常见问题及解决方案。

---

## 🚀 快速启动相关

### Q1: 项目文件打不开怎么办？

**问题**: 在微信开发者工具中打开项目时提示"无法打开项目"

**解决方案**:
1. 确保文件路径中没有中文或特殊字符
2. 检查 project.config.json 中的 appid 是否正确
3. 尝试使用"重建npm"功能（工具 → 构建npm）

---

### Q2: 页面显示错误或空白？

**问题**: 打开某个页面显示空白或报错

**解决方案**:
1. 打开开发者工具的控制台查看错误信息
2. 检查 app.json 中的页面路径是否正确
3. 确认页面文件夹名称和文件名拼写
4. 清除缓存：工具 → 清缓存 → 全部清除

**常见错误**:
```
// ❌ 错误
"pages": ["pages/index/index.js"]

// ✅ 正确
"pages": ["pages/index/index"]
```

---

### Q3: 组件引用失败？

**问题**: 自定义组件不显示，控制台提示找不到组件

**解决方案**:
1. 检查页面 .json 中的组件路径是否正确
2. 确认组件文件夹和文件名拼写
3. 确保组件 .json 中包含 `"component": true`

```json
// 页面 .json 中正确的引用方式
{
  "usingComponents": {
    "navigation-bar": "/components/navigation-bar/navigation-bar"
  }
}
```

---

## 📊 数据相关

### Q4: 购物车数据经常丢失？

**问题**: 刷新页面或关闭小程序后购物车数据消失

**解决方案**:
1. 这是正常现象，浏览器清除缓存会导致数据丢失
2. 生产环境需在登录后将购物车同步到服务器
3. 可添加云存储来永久保存用户数据

**改进方案**:
```javascript
// 定期同步购物车到服务器
onUnload() {
  const cart = Storage.getCart();
  API.cart.sync(cart);
}
```

---

### Q5: 如何实现购物车的服务器同步？

**步骤**:
1. 用户登录后获取 token
2. 修改 http.js 添加认证头

```javascript
// 在 request 方法中添加
const header = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
};
```

3. 在关键操作后调用同步接口

```javascript
// 添加商品后同步
Storage.setCart(cart);
API.cart.sync(cart);
```

---

### Q6: 订单数据如何与后端同步？

**方案**:
1. 创建订单时调用后端 API
2. 使用服务器返回的订单 ID 替代本地生成的 ID
3. 定期从服务器拉取订单更新

```javascript
// 替换本地订单创建为服务器创建
const order = await API.order.create(orderData);
Storage.addOrder(order);
```

---

## 🔧 功能实现

### Q7: 如何实现真实微信支付？

**步骤**:
1. 后端生成微信支付参数
2. 获取支付授权

```javascript
// 替换模拟支付
payOrder() {
  // 获取支付参数
  API.payment.requestWeChatPay({orderId: this.data.orderId})
    .then(payData => {
      // 发起真实支付
      wx.requestPayment({
        ...payData,
        success: () => {
          this.handlePaymentSuccess();
        },
        fail: (error) => {
          wx.showToast({title: '支付失败', icon: 'none'});
        }
      });
    });
}
```

3. 配置支付成功回调

---

### Q8: 如何添加新的页面？

**步骤**:
1. 在 pages 目录创建新文件夹
2. 创建 4 个文件: .js, .wxml, .wxss, .json

```
pages/
  new-page/
    ├── new-page.js
    ├── new-page.wxml
    ├── new-page.wxss
    └── new-page.json
```

3. 在 app.json 中添加页面路由

```json
{
  "pages": [
    "pages/index/index",
    "pages/new-page/new-page"
  ]
}
```

---

### Q9: 如何修改商品列表的数据源？

**当前代码**:
```javascript
// 使用本地模拟数据
loadGoodsList() {
  const mockGoodsList = [...];
  this.setData({goodsList: mockGoodsList});
}
```

**改为服务器数据**:
```javascript
loadGoodsList() {
  this.setData({ loading: true });
  
  API.goods.getList()
    .then(data => {
      this.setData({
        goodsList: data,
        filteredGoodsList: data,
        loading: false
      });
    })
    .catch(error => {
      wx.showToast({title: '加载失败', icon: 'none'});
      this.setData({ loading: false });
    });
}
```

---

### Q10: 如何添加商品筛选功能？

**增强搜索功能**:
```javascript
// 在 index.js 中扩展 filterGoods
filterGoods() {
  const { goodsList, currentCategoryId, searchKeyword, priceRange } = this.data;
  let filteredList = [...goodsList];

  // 按分类过滤
  if (currentCategoryId !== 0) {
    filteredList = filteredList.filter(item => 
      item.categoryId === currentCategoryId
    );
  }

  // 按关键词过滤
  if (searchKeyword) {
    filteredList = filteredList.filter(item => 
      item.name.includes(searchKeyword)
    );
  }

  // 按价格范围过滤（新增）
  if (priceRange) {
    filteredList = filteredList.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );
  }

  this.setData({ filteredGoodsList: filteredList });
}
```

---

## 🎨 样式相关

### Q11: 如何修改项目的主色调？

**全局颜色修改**:
1. 在 app.wxss 中定义颜色变量

```css
/* app.wxss */
page {
  --primary-color: #1296db;
  --accent-color: #ff6b35;
  --text-color: #333333;
}
```

2. 在各页面中使用变量

```css
.primary-btn {
  background-color: var(--primary-color);
}
```

---

### Q12: 如何实现暗黑模式？

**实现方法**:
```javascript
// 在 app.js 中检测系统主题
onLaunch() {
  const darkMode = wx.getSystemInfoSync().theme === 'dark';
  this.globalData.darkMode = darkMode;
  
  // 监听主题变化
  wx.onThemeChange(res => {
    this.globalData.darkMode = res.theme === 'dark';
  });
}
```

然后在 wxss 中使用：
```css
@media (prefers-color-scheme: dark) {
  page {
    background-color: #1a1a1a;
  }
}
```

---

## 🐛 调试相关

### Q13: 如何查看本地存储数据？

**方法**:
1. 打开开发者工具控制台
2. 使用以下代码查看：

```javascript
// 在控制台执行
const cart = wx.getStorageSync('cart_items');
console.log('购物车:', cart);

const userInfo = wx.getStorageSync('user_info');
console.log('用户信息:', userInfo);

const orders = wx.getStorageSync('order_history');
console.log('订单历史:', orders);
```

---

### Q14: 如何调试网络请求？

**使用 Network 面板**:
1. 打开开发者工具 → Network 标签
2. 操作页面时查看请求
3. 点击请求查看详细信息（请求头、响应体等）

**添加请求日志**:
```javascript
// 在 http.js 中添加日志
request(method, endpoint, data, options = {}) {
  console.log(`[${method}] ${endpoint}`, data);
  
  // ... 请求逻辑 ...
  
  success: (response) => {
    console.log(`[${method}] 响应:`, response.data);
    resolve(response.data);
  }
}
```

---

### Q15: 页面性能优化建议？

**优化方案**:

1. **减少 setData 频率**:
```javascript
// ❌ 不好 - 频繁更新
for (let item of list) {
  this.setData({...}); // 循环更新
}

// ✅ 好 - 一次更新
const newData = {};
for (let item of list) {
  Object.assign(newData, item);
}
this.setData(newData);
```

2. **列表虚拟化**:
```html
<!-- 使用 scroll-view 而不是长列表 -->
<scroll-view scroll-y type="list">
  <view wx:for="{{items}}" wx:key="id">{{item}}</view>
</scroll-view>
```

3. **图片优化**:
```wxml
<!-- 使用合适的图片大小和格式 -->
<image src="image.jpg" mode="aspectFill" lazy-load="true"></image>
```

---

## 🔐 安全相关

### Q16: 如何保护用户隐私？

**建议**:
1. 不要在客户端存储敏感信息（如密码）
2. 使用 HTTPS 传输所有数据
3. 实现数据加密

```javascript
// ❌ 不要这样做
Storage.setUserInfo({
  userId: 'xxx',
  password: 'xxx' // 不要存储密码
});

// ✅ 这样做
Storage.setUserInfo({
  userId: 'xxx',
  token: 'jwt_token' // 存储 token
});
```

---

### Q17: 如何防止 XSS 攻击？

**方法**:
1. 避免使用 rich-text 显示用户输入
2. 对用户输入进行验证和清理
3. 使用模板字符串而不是字符串拼接

```javascript
// ❌ 危险
const html = `<view>${userInput}</view>`;

// ✅ 安全
const cleanInput = userInput.replace(/[<>]/g, '');
this.setData({userInput: cleanInput});
```

---

## 📈 功能扩展

### Q18: 如何添加推荐算法？

**简单实现**:
```javascript
getRecommendedGoods() {
  // 基于浏览历史推荐
  const history = Storage.getGoodsHistory();
  
  return this.data.goodsList.filter(item => {
    // 排除已购买的商品
    if (history.purchased.includes(item.id)) return false;
    
    // 推荐相同分类的商品
    return history.viewedCategories.includes(item.categoryId);
  });
}
```

---

### Q19: 如何实现用户评价功能？

**步骤**:
1. 添加评价页面 pages/comment/
2. 在订单详情页添加"评价"按钮
3. 创建 API 接口保存评价

```javascript
// 在 order-detail.js 中
onComment() {
  wx.navigateTo({
    url: `/pages/comment/comment?orderId=${this.data.order.orderId}`
  });
}
```

---

### Q20: 如何实现优惠券功能？

**方案**:
1. 创建优惠券数据结构
2. 在订单确认页显示可用优惠券
3. 计算优惠后价格

```javascript
data: {
  coupons: [
    {id: 1, name: '9折优惠', discount: 0.1, minAmount: 50}
  ],
  selectedCoupon: null
}

applyCoupon(e) {
  const coupon = e.currentTarget.dataset.coupon;
  if (this.data.totalPrice >= coupon.minAmount) {
    this.setData({selectedCoupon: coupon});
    this.calculateFinalPrice();
  }
}
```

---

## 💡 最佳实践

### Q21: 项目结构有什么最佳实践吗？

**推荐结构**:
```
src/
├── pages/          # 页面
├── components/     # 组件
├── utils/          # 工具
├── config/         # 配置
├── constants/      # 常量
└── styles/         # 全局样式
```

---

### Q22: 错误处理的最佳实践？

**方法**:
```javascript
// 统一错误处理
API.goods.getList()
  .then(data => {
    // 成功处理
  })
  .catch(error => {
    // 统一错误提示
    wx.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
    
    // 记录错误日志
    console.error('[错误]', error);
  });
```

---

## 📞 无法解决的问题

### 如果以上方案都无法解决？

1. **查看官方文档**:
   - [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/)
   - [微信支付文档](https://pay.weixin.qq.com/)

2. **查看控制台错误**:
   - 打开开发者工具
   - 查看控制台的详细错误信息
   - 搜索错误码找到解决方案

3. **社区求助**:
   - 微信小程序开发者社区
   - Stack Overflow
   - GitHub Issues

4. **检查项目配置**:
   - 确保 AppID 正确
   - 检查开发服务器域名白名单
   - 验证支付/网络权限配置

---

**最后更新**: 2024年1月19日  
**文档版本**: v1.0
