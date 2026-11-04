# 后端 API 接口文档

本文档定义了微信小程序前端与后端的所有 API 接口规范。

## API 基础配置

### 基础 URL
```
https://your-api-domain.com/api
```

### 通用请求头
```
Content-Type: application/json
Authorization: Bearer {token} (如需要)
```

### 通用响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {...}
}
```

## 错误码说明

| 代码 | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/登录过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1. 商品管理接口

### 1.1 获取商品列表

**请求**
```
GET /api/goods/list
```

**参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | int | 否 | 分类ID，0 表示全部 |
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词 |

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "黄焖鸡米饭",
      "description": "鲜嫩多汁，营养丰富",
      "price": 18.00,
      "image": "https://...",
      "categoryId": 1,
      "stock": 100,
      "status": 1,
      "createTime": "2024-01-19 10:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### 1.2 获取商品详情

**请求**
```
GET /api/goods/{goodsId}
```

**参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| goodsId | int | 是 | 商品ID |

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "黄焖鸡米饭",
    "description": "鲜嫩多汁，营养丰富",
    "price": 18.00,
    "image": "https://...",
    "categoryId": 1,
    "stock": 100,
    "tags": ["主食", "热菜"],
    "status": 1
  }
}
```

---

### 1.3 搜索商品

**请求**
```
GET /api/goods/search
```

**参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| limit | int | 否 | 返回数量，默认20 |

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {商品对象...}
  ]
}
```

---

## 2. 用户管理接口

### 2.1 用户登录

**请求**
```
POST /api/user/login
```

**请求体**
```json
{
  "code": "1234567890",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "https://..."
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": "user_123",
    "token": "jwt_token_xxx",
    "nickName": "用户昵称",
    "avatarUrl": "https://...",
    "openid": "wx_openid_xxx",
    "phone": "13800138000",
    "createTime": "2024-01-19 10:00:00"
  }
}
```

---

### 2.2 获取用户信息

**请求**
```
GET /api/user/info
```

**请求头**
```
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": "user_123",
    "nickName": "用户昵称",
    "avatarUrl": "https://...",
    "phone": "13800138000",
    "openid": "wx_openid_xxx",
    "createTime": "2024-01-19 10:00:00"
  }
}
```

---

### 2.3 更新用户信息

**请求**
```
PUT /api/user/info
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "nickName": "新昵称",
  "phone": "13800138000"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": "user_123",
    "nickName": "新昵称",
    "phone": "13800138000"
  }
}
```

---

## 3. 订单管理接口

### 3.1 创建订单

**请求**
```
POST /api/order/create
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "goods": [
    {
      "goodsId": 1,
      "quantity": 2,
      "price": 18.00
    }
  ],
  "totalPrice": 36.00,
  "mealLocation": {
    "location": "食堂3楼取餐点",
    "phone": "13800138000"
  },
  "remarks": "不要辣"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "userId": "user_123",
    "goods": [...],
    "totalPrice": 36.00,
    "status": "pending",
    "paymentStatus": "unpaid",
    "mealLocation": {...},
    "createTime": "2024-01-19 12:00:00",
    "expireTime": "2024-01-19 12:30:00"
  }
}
```

---

### 3.2 获取订单列表

**请求**
```
GET /api/order/list
```

**请求头**
```
Authorization: Bearer {token}
```

**参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 订单状态: pending/paid/completed/cancelled |
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "orderId": "ORD2024011912345",
      "totalPrice": 36.00,
      "status": "paid",
      "goods": [...],
      "createTime": "2024-01-19 12:00:00"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

---

### 3.3 获取订单详情

**请求**
```
GET /api/order/{orderId}
```

**请求头**
```
Authorization: Bearer {token}
```

**参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | string | 是 | 订单ID |

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "userId": "user_123",
    "goods": [
      {
        "goodsId": 1,
        "goodsName": "黄焖鸡米饭",
        "image": "https://...",
        "quantity": 2,
        "price": 18.00,
        "subtotal": 36.00
      }
    ],
    "totalPrice": 36.00,
    "status": "paid",
    "paymentStatus": "paid",
    "paymentMethod": "weixin",
    "mealLocation": {
      "location": "食堂3楼取餐点",
      "phone": "13800138000"
    },
    "remarks": "不要辣",
    "createTime": "2024-01-19 12:00:00",
    "paymentTime": "2024-01-19 12:05:00",
    "expireTime": "2024-01-19 12:30:00"
  }
}
```

---

### 3.4 更新订单状态

**请求**
```
PUT /api/order/{orderId}/status
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "status": "completed"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "status": "completed",
    "updateTime": "2024-01-19 12:20:00"
  }
}
```

---

### 3.5 取消订单

**请求**
```
PUT /api/order/{orderId}/cancel
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "reason": "不想要了"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "status": "cancelled",
    "cancelTime": "2024-01-19 12:10:00"
  }
}
```

---

## 4. 支付接口

### 4.1 请求微信支付

**请求**
```
POST /api/payment/wechat
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "orderId": "ORD2024011912345",
  "amount": 3600,
  "body": "餐饮订单"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "appId": "wx_appid",
    "timeStamp": "1234567890",
    "nonceStr": "random_str",
    "package": "prepay_id=wx21142134324343",
    "signType": "RSA",
    "paySign": "signature_xxx"
  }
}
```

---

### 4.2 查询支付状态

**请求**
```
GET /api/payment/{orderId}/status
```

**请求头**
```
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "status": "paid",
    "paymentMethod": "weixin",
    "paymentTime": "2024-01-19 12:05:00",
    "transactionId": "wx_transaction_id_xxx"
  }
}
```

---

### 4.3 订单支付

**请求**
```
POST /api/order/{orderId}/pay
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "paymentMethod": "weixin",
  "transactionId": "wx_transaction_id_xxx"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "ORD2024011912345",
    "paymentStatus": "paid",
    "paymentTime": "2024-01-19 12:05:00"
  }
}
```

---

## 5. 购物车接口（可选）

### 5.1 同步购物车

**请求**
```
POST /api/cart/sync
```

**请求头**
```
Authorization: Bearer {token}
```

**请求体**
```json
{
  "items": [
    {
      "goodsId": 1,
      "quantity": 2,
      "selected": true
    }
  ]
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 1,
    "items": [...]
  }
}
```

---

## 实现检查清单

- [ ] 商品管理接口
  - [ ] 获取商品列表（支持分页、搜索、分类）
  - [ ] 获取商品详情
  - [ ] 搜索商品

- [ ] 用户管理接口
  - [ ] 用户登录（微信授权）
  - [ ] 获取用户信息
  - [ ] 更新用户信息

- [ ] 订单管理接口
  - [ ] 创建订单
  - [ ] 获取订单列表（支持按状态筛选）
  - [ ] 获取订单详情
  - [ ] 更新订单状态
  - [ ] 取消订单

- [ ] 支付接口
  - [ ] 请求微信支付
  - [ ] 查询支付状态
  - [ ] 订单支付确认

- [ ] 购物车接口（可选）
  - [ ] 同步购物车

---

## 测试建议

1. **使用 Postman 或类似工具测试所有接口**
2. **确保错误响应格式统一**
3. **验证认证和授权机制**
4. **测试边界情况和异常处理**
5. **性能测试（查询大量数据）**
